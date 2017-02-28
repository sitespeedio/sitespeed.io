'use strict';

let path = require('path'),
  urlParser = require('url'),
  messageMaker = require('../../support/messageMaker'),
  Lighthouse = require('lighthouse'),
  ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher.js').ChromeLauncher,
  CriticalRequestChains  = require('lighthouse/lighthouse-core/formatters/critical-request-chains.js');

const make = messageMaker('webpagetest').make;

function launchChromeAndRunLighthouse(url, flags, config) {
  const launcher = new ChromeLauncher({port: 9222, autoSelectChrome: true});

  return launcher.isDebuggerReady()
    .catch(() => {
      if (flags.skipAutolaunch) {
        return;
      }
      return launcher.run(); // Launch Chrome.
    })
    .then(() => Lighthouse(url, flags, config)) // Run Lighthouse.
    .then(results => launcher.kill().then(() => results)) // Kill Chrome and return results.
    .catch(err => {
      // Kill Chrome if there's an error.
      return launcher.kill().then(() => {
        throw err;
      }, console.err);
    });
}

function cleanLighthouseResults(lighthouseResults) {
  let cleanResults = new Object;
  // aggregations
  cleanResults.aggregations = lighthouseResults.aggregations
    .filter(function(agg) { return agg.total !== null });
  // audits
  cleanResults.audits = new Object;
  const audit_template = function(obj) {
    return {"displayValue": obj.displayValue,
      "optimalValue": obj.optimalValue,
      "rawValue": obj.rawValue,
      "score": obj.score};
    };
  Object.keys(lighthouseResults.audits).forEach(key => {
    cleanResults.audits[key] = audit_template(lighthouseResults.audits[key]);
    if (key === "critical-request-chains") {
      cleanResults.audits[key]["longestChainLength"] = CriticalRequestChains
        ._getLongestChainLength(lighthouseResults.audits[key].extendedInfo.value);
      cleanResults.audits[key]["longestChainDuration"] = CriticalRequestChains
        ._getLongestChainDuration(lighthouseResults.audits[key].extendedInfo.value);
      cleanResults.audits[key]["longestChainTransferSize"] = CriticalRequestChains
        ._getLongestChainTransferSize(lighthouseResults.audits[key].extendedInfo.value);
    }
  });
  return cleanResults;
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    // when sitespeed.io start it calls the open function once for all plugins
    // the context holds information for this specific run that
    // generated at runtime, for example you can get hold of the storageManager
    // that stores files to disk.
    // The options is the configuration supplied for the run.
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url': {
        // Use an existing config or create a custom one.
        const config = require('lighthouse/lighthouse-core/config/perf.json');
        const group = message.group;
        const url = message.url;
        const flags = {output: 'html'};

        launchChromeAndRunLighthouse(url, flags, config).then(lighthouseResults => {
          lighthouseResults.artifacts = undefined; // You can save the artifacts separately if so desired
          lighthouseResults = cleanLighthouseResults(lighthouseResults);
          queue.postMessage(make('lighthouse.pageSummary', lighthouseResults, { url, group }));
          // debugger
          // return Printer.write(lighthouseResults, flags.output);
        }).catch(err => console.error(err));
      }
    }
  },
  close(options, errors) {
    // When all URLs are finished all plugins close function is called once.
    // Options are the configuration options and errors a array of errors
    // from the run.
  }
};