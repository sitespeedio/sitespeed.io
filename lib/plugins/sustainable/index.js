'use strict';

const path = require('path');
const fs = require('fs');
const log = require('intel').getLogger('sitespeedio.plugin.sustainable');
const Aggregator = require('./aggregator');

let tgwf;
try {
  tgwf = require('@tgwf/co2');
} catch (e) {
  tgwf = null;
}

const DEFAULT_METRICS_PAGE_SUMMARY = [
  'co2PerPageView',
  'totalCO2',
  'co2FirstParty',
  'co2ThirdParty'
];
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
    if (tgwf) {
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
          log.info('Use the sustainable web plugin');
          break;
        }

        case 'pagexray.run': {
          // We got data for a URL, lets calculate co2, check green servers etc
          const listOfDomains = Object.keys(message.data.domains);
          const greenDomainJSONpath = path.join(
            __dirname,
            'data',
            'url2green.json.gz'
          );

          let hostingGreenCheck;
          if (this.sustainableOptions.disableHosting === true) {
            hostingGreenCheck = [];
          } else {
            hostingGreenCheck =
              this.sustainableOptions.useGreenWebHostingAPI === true
                ? await tgwf.hosting.check(listOfDomains)
                : await tgwf.hosting.check(
                    listOfDomains,
                    await tgwf.hosting.loadJSON(greenDomainJSONpath)
                  );
          }
          const CO2 = new tgwf.co2();
          const co2PerDomain = CO2.perDomain(message.data, hostingGreenCheck);
          const baseDomain = message.data.baseDomain;

          const hostingInfo = {
            green: false,
            url: baseDomain
          };

          // is the base domain in our list of green domains?
          if (hostingGreenCheck.indexOf(baseDomain) > -1) {
            hostingInfo.green = true;
          }

          const co2PerParty = CO2.perParty(message.data, hostingGreenCheck);
          // Fetch the resources with the largest CO2 impact. ie,
          // the resources to optimise, host somewhere green, or contact
          // a supplier about
          const dirtiestResources = CO2.dirtiestResources(
            message.data,
            hostingGreenCheck
          );

          const co2PerContentType = CO2.perContentType(
            message.data,
            hostingGreenCheck
          );

          const co2PerPageView = CO2.perPage(message.data, hostingGreenCheck);

          const totalCO2 = this.sustainableOptions.pageViews
            ? this.sustainableOptions.pageViews * co2PerPageView
            : co2PerPageView;

          const transferPerPage = message.data.transferSize;
          const firstPartyTransferPerPage =
            message.data.firstParty.transferSize;
          const thirdPartyTransferPerPage =
            message.data.thirdParty.transferSize;

          // adding these to make the link between data and CO2 clearer
          // and also so we can give an idea how big this is compared to
          // the norm
          // let transfer1stParty, transfer3rdParty;

          if (message.iteration === 1) {
            this.firstRunsData[message.url] = {
              co2PerDomain,
              co2PerContentType,
              dirtiestResources,
              hostingGreenCheck
            };
          }
          // We get data per run, so we want to aggregate that per page (multiple runs per page)
          // and per group/domain
          aggregator.addStats(
            {
              co2PerDomain,
              co2PerPageView,
              co2PerParty,
              hostingInfo,
              totalCO2,
              transferPerPage,
              firstPartyTransferPerPage,
              thirdPartyTransferPerPage
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
                totalTransfer: transferPerPage,
                firstPartyTransferPerPage,
                thirdPartyTransferPerPage,
                co2FirstParty: co2PerParty.firstParty,
                co2ThirdParty: co2PerParty.thirdParty,
                hostingGreenCheck,
                dirtiestResources,
                co2PerContentType
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
    } else {
      log.info(
        'Not using the sustainable web plugin since the dependencies is not installed'
      );
    }
  }
};
