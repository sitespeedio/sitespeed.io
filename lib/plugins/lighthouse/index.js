'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.lighthouse');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const messageMaker = require('../../support/messageMaker');
const filterRegistry = require('../../support/filterRegistry');
const make = messageMaker('lighthouse').make;
const aggregator = require('./aggregator');

const DEFAULT_SUMMARY_METRICS = [
  'criticalrequestchains',
  'firstmeaningfulpaint',
  'speedindexmetric',
  'estimatedinputlatency',
  'firstinteractive',
  'consistentlyinteractive'
];
const PORT = '9222';
const flags = {
  port: PORT,
  chromeFlags: [
    `--remote-debugging-port=${PORT}`,
    //‘--disable-web-security’,
    //‘--disable-device-discovery-notifications’,
    //‘--acceptSslCerts’,
    '--no-sandbox',
    //‘--ignore-certificate-errors’,
    '--headless',
    '--disable-gpu'
  ]
};

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
  return chromeLauncher.launch(flags).then(chrome => {
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results)
    );
  });
}

module.exports = {
  open() {
    filterRegistry.registerFilterForType(
      DEFAULT_SUMMARY_METRICS,
      'lighthouse.summary'
    );
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url': {
        const config = {
          passes: [
            {
              recordTrace: true,
              pauseAfterLoadMs: 5250,
              networkQuietThresholdMs: 5250,
              cpuQuietThresholdMs: 5250,
              useThrottling: true,
              gatherers: []
            }
          ],
          audits: [
            'critical-request-chains',
            'first-meaningful-paint',
            'speed-index-metric',
            'estimated-input-latency',
            'first-interactive',
            'consistently-interactive'
          ]
        };

        const url = message.url;
        const group = message.group;
        log.info('Collecting Lighthouse result');
        return launchChromeAndRunLighthouse(url, flags, config)
          .then(results => {
            aggregator.addToAggregate(results.audits, group);
            log.info('Finished collecting Lighthouse result');
          })
          .catch(err => {
            log.error('Error creating Lighthouse result ', err);
            queue.postMessage(
              make('error', err, {
                url
              })
            );
          });
      }
      case 'summarize': {
        const summary = aggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('lighthouse.summary', summary.groups[group], { group })
            );
          }
        }
      }
    }
  }
};
