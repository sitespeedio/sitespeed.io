'use strict';
const Stats = require('fast-stats').Stats;
const statsHelpers = require('../../support/statsHelpers');
class AxeAggregator {
  constructor(options) {
    this.options = options;
    this.axeViolations = {
      critical: new Stats(),
      serious: new Stats(),
      minor: new Stats(),
      moderate: new Stats()
    };
  }

  addStats(axeData) {
    const violations = {
      critical: 0,
      serious: 0,
      minor: 0,
      moderate: 0
    };
    for (let violation of axeData.violations) {
      violations[violation.impact] += 1;
    }

    for (let type of Object.keys(violations)) {
      this.axeViolations[type].push(violations[type]);
    }

    return violations;
  }

  summarizeStats() {
    return {
      violations: {
        critical: statsHelpers.summarizeStats(this.axeViolations.critical),
        serious: statsHelpers.summarizeStats(this.axeViolations.serious),
        minor: statsHelpers.summarizeStats(this.axeViolations.minor),
        moderate: statsHelpers.summarizeStats(this.axeViolations.moderate)
      }
    };
  }
}

module.exports = AxeAggregator;
