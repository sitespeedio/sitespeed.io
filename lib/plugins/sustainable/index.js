'use strict';

const path = require('path');
const fs = require('fs');
const co2 = require('./co2');
const hosting = require('./hosting');
const Aggregator = require('./aggregator');

const DEFAULT_METRICS_PAGE_SUMMARY = ['co2PerPageView', 'totalCO2'];
module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
    this.sustainableOptions = options.sustainable || {};
    this.make = context.messageMaker('sustainable').make;
    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    this.aggregator = new Aggregator(options);
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGE_SUMMARY,
      'sustainable.pageSummary'
    );
  },
  async processMessage(message, queue) {
    const make = this.make;
    const aggregator = this.aggregator;

    switch (message.type) {
      // When sitespeed.io starts, it sends a setup message on the queue
      // That way, we can tell other plugins we exist (sustainable.setup)
      // so others could build upon our data
      // ... and we also register the pug file(s) for the HTML output
      case 'sitespeedio.setup': {
        queue.postMessage(make('sustainable.setup'));
        // Add the HTML pugs
        queue.postMessage(
          make('html.pug', {
            id: 'sustainable',
            name: 'Sustainable Web',
            pug: this.pug,
            type: 'pageSummary'
          })
        );
        queue.postMessage(
          make('html.pug', {
            id: 'sustainable',
            name: 'Sustainable Web',
            pug: this.pug,
            type: 'run'
          })
        );
        break;
      }

      case 'pagexray.run': {
        // We got data for a URL, lets calculate co2, check green servers etc
        const greenCheckResults = this.sustainableOptions.hosting
          ? await hosting.isGreen(message.data)
          : {};

        const Co2PerDomain = co2.perDomain(message.data, greenCheckResults)
        const hostingInfo = greenCheckResults[0];
        const allGreenChecks = greenCheckResults[1];

        // TODO. fetch the resources with the largest CO2 impact. ie,
        // the resources to optimise, host somewhere green, or contact
        // a supplier about
        // const dirtiestResources = co2.dirtiestResources(message.data, greenCheckResults)

        const co2FromTransfer = co2.perPage(message.data, this.options);
        const co2PerPageView = allGreenChecks ? co2.adjustedPerPage(Co2PerDomain) : co2FromTransfer;

        const totalCO2 = this.sustainableOptions.pageViews
          ? this.sustainableOptions.pageViews * co2PerPageView
          : co2PerPageView;

        // We get data per run, so we want to aggregate that per page (multiple runs per page)
        // and per group/domain
        aggregator.addStats(
          { co2PerPageView, totalCO2, hostingInfo, Co2PerDomain },
          message.group,
          message.url
        );

        // We pass on the data we have, so the that HTML plugin can generate the HTML tab
        // per run
        queue.postMessage(
          make(
            'sustainable.run',
            { co2PerPageView, totalCO2, hostingInfo, Co2PerDomain },
            {
              url: message.url,
              group: message.group,
              runIndex: message.runIndex
            }
          )
        ); // Here we put the data that we got from that run
        break;
      }

      case 'sitespeedio.summarize': {
        // All URLs has been tested, now calculate the min/median/max c02 per page
        // and push that info on the queue
        const summaries = aggregator.summarize();
        for (let summary of summaries) {
          queue.postMessage(
            make(
              'sustainable.pageSummary',
              summary.data, //
              {
                url: summary.url,
                group: summary.group
              }
            )
          );
        }
        break;
      }
    }
  }
};
