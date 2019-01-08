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
    const consoleData = await getGzippedFileAsJson(
      this.options.resultDir,
      pathToFile
    );

    // For each log entry, add them to the total
    for (let logMessage of consoleData) {
      if (this.logs[logMessage.level] !== undefined) {
        this.logs[logMessage.level].push(1);
      }
    }
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
