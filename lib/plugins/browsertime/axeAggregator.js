import { Stats } from 'fast-stats';
import { summarizeStats as _summarizeStats } from '../../support/statsHelpers.js';
export class AxeAggregator {
  constructor(options) {
    this.options = options;
    this.axeViolations = {
      critical: new Stats(),
      serious: new Stats(),
      minor: new Stats(),
      moderate: new Stats()
    };
    this.axeViolationIssues = {
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

    const violationIssues = {
      critical: 0,
      serious: 0,
      minor: 0,
      moderate: 0
    };
    for (let violation of axeData.violations) {
      violations[violation.impact] += 1;
      violationIssues[violation.impact] += violation.nodes.length;
    }

    for (let type of Object.keys(violations)) {
      this.axeViolations[type].push(violations[type]);
      this.axeViolationIssues[type].push(violationIssues[type]);
    }

    return { violations, violationIssues };
  }

  summarizeStats() {
    return {
      violations: {
        critical: _summarizeStats(this.axeViolations.critical),
        serious: _summarizeStats(this.axeViolations.serious),
        minor: _summarizeStats(this.axeViolations.minor),
        moderate: _summarizeStats(this.axeViolations.moderate)
      },
      violationIssues: {
        critical: _summarizeStats(this.axeViolationIssues.critical),
        serious: _summarizeStats(this.axeViolationIssues.serious),
        minor: _summarizeStats(this.axeViolationIssues.minor),
        moderate: _summarizeStats(this.axeViolationIssues.moderate)
      }
    };
  }
}
