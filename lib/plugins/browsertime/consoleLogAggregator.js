'use strict';
const Stats = require('fast-stats').Stats;
const statsHelpers = require('../../support/statsHelpers');
const { getGzippedFileAsJson } = require('./reader.js');
class ConsoleLogAggregator {
  constructor(options) {
    this.options = options;
    this.logs = { SEVERE: new Stats(), WARNING: new Stats() };
  }

  async addStats(iteration, pathToFile) {
    let numberOfSevere = 0;
    let numberOfWarnings = 0;
    const consoleData = await getGzippedFileAsJson(
      this.options.resultDir,
      pathToFile
    );

    // For each log entry, add them to the total
    for (let logMessage of consoleData) {
      if (this.logs[logMessage.level] !== undefined) {
        if (logMessage.level === 'SEVERE') {
          numberOfSevere++;
        } else if (logMessage.level === 'WARNING') {
          numberOfWarnings++;
        }
      }
    }

    this.logs['SEVERE'].push(numberOfSevere);
    this.logs['WARNING'].push(numberOfWarnings);

    return consoleData;
  }

  summarizeStats() {
    return {
      error: statsHelpers.summarizeStats(this.logs.SEVERE),
      warning: statsHelpers.summarizeStats(this.logs.WARNING)
    };
  }
}

module.exports = ConsoleLogAggregator;
