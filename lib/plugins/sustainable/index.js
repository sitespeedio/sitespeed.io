'use strict';

const path = require('path');
const fs = require('fs');
const log = require('intel').getLogger('sitespeedio.plugin.sustainable');
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
    this.firstRunsData = {};
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
        log.info('Sustainable is setup');
        break;
      }

      case 'pagexray.run': {
        // We got data for a URL, lets calculate co2, check green servers etc
        const hostingGreenCheck = await hosting.greenDomains(message.data);

        const co2PerDomain = co2.perDomain(message.data, hostingGreenCheck);
        const baseDomain = message.data.baseDomain;

        const hostingInfo = {
          green: false,
          url: baseDomain
        };

        // is the base domain in our list of green domains?
        if (hostingGreenCheck.indexOf(baseDomain) > -1) {
          hostingInfo.green = true;
        }

        const co2PerParty = co2.perParty(message.data, hostingGreenCheck);
        // Fetch the resources with the largest CO2 impact. ie,
        // the resources to optimise, host somewhere green, or contact
        // a supplier about
        const dirtiestResources = co2.dirtiestResources(
          message.data,
          hostingGreenCheck
        );

        // is it javascript or images, or video that's the biggest source of emissions?
        // const co2byContentType = co2.dirtiestResources(
        //   message.data,
        //   greenCheckResults
        // );

        const co2PerPageView = co2.perPage(message.data, hostingGreenCheck);

        const totalCO2 = this.sustainableOptions.pageViews
          ? this.sustainableOptions.pageViews * co2PerPageView
          : co2PerPageView;

        if (message.iteration === 1) {
          this.firstRunsData[message.url] = {
            co2PerDomain,
            hostingGreenCheck,
            dirtiestResources
          };
        }
        // We get data per run, so we want to aggregate that per page (multiple runs per page)
        // and per group/domain
        aggregator.addStats(
          {
            co2PerPageView,
            totalCO2,
            hostingInfo,
            co2PerDomain,
            co2PerParty
          },
          message.group,
          message.url
        );

        // We pass on the data we have, so the that HTML plugin can generate the HTML tab
        // per run
        queue.postMessage(
          make(
            'sustainable.run',
            {
              co2PerPageView,
              totalCO2,
              hostingInfo,
              co2PerDomain,
              co2FirstParty: co2PerParty.firstParty,
              co2ThirdParty: co2PerParty.thirdParty,
              hostingGreenCheck,
              dirtiestResources
            },
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

        // Send each URL
        for (let url of Object.keys(summaries.urls)) {
          const extras = this.firstRunsData[url];
          // Attach first run so we can show that extra data that we don't collect stats for
          summaries.urls[url].firstRun = extras;
          queue.postMessage(
            make('sustainable.pageSummary', summaries.urls[url], {
              url: url,
              group: summaries.urlToGroup[url]
            })
          );
        }

        queue.postMessage(
          make('sustainable.summary', summaries.groups['total'], {
            group: 'total'
          })
        );
        break;
      }
    }
  }
};
