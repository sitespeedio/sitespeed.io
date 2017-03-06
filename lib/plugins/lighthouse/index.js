'use strict';

let path = require('path'),
  urlParser = require('url'),
  messageMaker = require('../../support/messageMaker'),
  Lighthouse = require('lighthouse'),
  ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher.js').ChromeLauncher,
  CriticalRequestChains  = require('lighthouse/lighthouse-core/formatters/critical-request-chains.js'),
  Stats = require('fast-stats').Stats;

const make = messageMaker('webpagetest').make;
const cleanLighthouseResults = function (lighthouseResults) {
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
    if (lighthouseResults.audits[key].error !== true) {
      cleanResults.audits[key] = audit_template(lighthouseResults.audits[key]);
      if (key === "critical-request-chains") {
        cleanResults.audits[key]["longestChainLength"] = CriticalRequestChains
          ._getLongestChainLength(lighthouseResults.audits[key].extendedInfo.value);
        cleanResults.audits[key]["longestChainDuration"] = CriticalRequestChains
          ._getLongestChainDuration(lighthouseResults.audits[key].extendedInfo.value);
        cleanResults.audits[key]["longestChainTransferSize"] = CriticalRequestChains
          ._getLongestChainTransferSize(lighthouseResults.audits[key].extendedInfo.value);
      }
    }
  });
  return cleanResults;
}

const summarizeResultsByMedian = function(repResult, results) {
  if (Array.isArray(repResult)) {
    repResult.forEach((obj, index) => {
      repResult[index] = summarizeResultsByMedian(repResult[index], results.map((r) => {return r[index];}));
    })
  } else if (typeof(repResult) === 'object') {
    Object.keys(repResult).forEach((key) => {
      repResult[key] = summarizeResultsByMedian(repResult[key], results.map((r) => {return r[key];}));
    });
  } else if (typeof(repResult) === 'number') {
    let stats = new Stats;
    let values = stats.push(results.map((r) => {return r;}));
    repResult = values.median();
  } else {
    let values = results.map((r) => {return r;});
    let uniqValuesCount = Array.from(new Set(values)).length;
    if (uniqValuesCount === 1) {
      repResult = values[0];
    } else {
      repResult = values.join(',');
    }
  }
  return repResult;
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'browsertime.extraJsonDir': {
        let config = require('lighthouse/lighthouse-core/config/perf.json');
        const fs = require('fs');

        fs.readdir(message.data, (err, files) => {
          let perfLogs = files.filter((f) => { return /chromePerflog-(\d+).json/.exec(f) })
          let traces = files.filter((f) => { return /trace-(\d+).json/.exec(f) })
          let lighthousePromises = [];

          perfLogs.forEach((perfLog, index) => {
            config = Object.assign(config, {
              "artifacts": {
                "traces": {
                  "defaultPass": `${message.data}/${traces[index]}`
                },
                "performanceLog": `${message.data}/${perfLog}`
              }
            });
            delete config["passes"];
            let lighthousePromise = Lighthouse(message.url, {}, config)
              .then(results => {
                let url = message.url;
                let group = message.group;
                return cleanLighthouseResults(results);
              })
              .catch(err => {
                console.err;
                return;
              });
            lighthousePromises.push(lighthousePromise);
          });
          Promise.all(lighthousePromises)
            .then(allResults => {
              let url = message.url;
              let group = message.group;
              let medianReport = summarizeResultsByMedian(allResults[0], allResults);
              queue.postMessage(make('lighthouse.pageSummary', {'median': medianReport}, {url, group}));
              return;
            });
        });
      }
    }
  },
  close(options, errors) {
  }
};
