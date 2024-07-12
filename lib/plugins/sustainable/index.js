import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

import intel from 'intel';
import { co2, hosting } from '@tgwf/co2';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { Aggregator } from './aggregator.js';
import {
  getDirtiestResources,
  perParty,
  perContentType,
  perPage,
  perDomain
} from './helper.js';

const fsp = fs.promises;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const packageJson = JSON.parse(
  await fsp.readFile(
    path.resolve(path.join(__dirname, '..', '..', '..', 'package.json'))
  )
);
const co2Version = packageJson.dependencies['@tgwf/co2'];

const gunzip = promisify(zlib.gunzip);
const log = intel.getLogger('sitespeedio.plugin.sustainable');

const DEFAULT_METRICS_PAGE_SUMMARY = [
  'co2PerPageView',
  'totalCO2',
  'co2FirstParty',
  'co2ThirdParty'
];

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('error', reject);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function getGzippedFileAsJson(jsonPath) {
  const readStream = fs.createReadStream(jsonPath);
  const text = await streamToString(readStream);
  const unzipped = await gunzip(text);
  return unzipped.toString();
}

async function loadJSON(jsonPath) {
  const jsonBuffer = jsonPath.endsWith('.gz')
    ? await getGzippedFileAsJson(jsonPath)
    : await fsp.readFile(jsonPath);
  return JSON.parse(jsonBuffer);
}

export default class SustainablePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'sustainable', options, context, queue });
  }

  async open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
    this.sustainableOptions = options.sustainable || {};
    this.make = context.messageMaker('sustainable').make;
    this.pug = await fsp.readFile(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    this.aggregator = new Aggregator(options);
    this.firstRunsData = {};
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGE_SUMMARY,
      'sustainable.pageSummary'
    );
  }
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
        log.info(
          'Use the sustainable web plugin with model %s',
          this.sustainableOptions.model
        );
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
              ? await hosting.check(listOfDomains, undefined, 'sitespeed.io')
              : await hosting.check(
                  listOfDomains,
                  await loadJSON(greenDomainJSONpath)
                );
        }

        const configuration = { model: this.sustainableOptions.model };
        if (this.sustainableOptions.model === 'swd') {
          configuration.version = this.sustainableOptions.modelVersion;
        }
        const CO2 = new co2(configuration);
        const co2PerDomain = perDomain(message.data, hostingGreenCheck, CO2);
        const baseDomain = message.data.baseDomain;

        const hostingInfo = {
          green: false,
          url: baseDomain
        };

        // is the base domain in our list of green domains?
        if (hostingGreenCheck.includes(baseDomain)) {
          hostingInfo.green = true;
        }

        const co2PerParty = perParty(message.data, hostingGreenCheck, CO2);
        // Fetch the resources with the largest CO2 impact. ie,
        // the resources to optimise, host somewhere green, or contact
        // a supplier about
        const dirtiestResources = getDirtiestResources(
          message.data,
          hostingGreenCheck,
          CO2
        );

        const co2PerContentType = perContentType(
          message.data,
          hostingGreenCheck,
          CO2
        );

        const co2PerPageView = perPage(message.data, hostingGreenCheck, CO2);

        const totalCO2 = this.sustainableOptions.pageViews
          ? this.sustainableOptions.pageViews * co2PerPageView
          : co2PerPageView;

        const transferPerPage = message.data.transferSize;
        const firstPartyTransferPerPage = message.data.firstParty.transferSize;
        const thirdPartyTransferPerPage = message.data.thirdParty.transferSize;

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
              co2PerContentType,
              co2Version
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

          summaries.urls[url].co2Version = co2Version;
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
}
