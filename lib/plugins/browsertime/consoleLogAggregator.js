import { Stats } from 'fast-stats';
import { summarizeStats as _summarizeStats } from '../../support/statsHelpers.js';
import { getGzippedFileAsJson } from './reader.js';
export class ConsoleLogAggregator {
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
      error: _summarizeStats(this.logs.SEVERE),
      warning: _summarizeStats(this.logs.WARNING)
    };
  }
}
