'use strict';

let metricsFilter = require('../lib/support/metricsFilter'),
  fs = require('fs'),
  path = require('path'),
  expect = require('chai').expect;

const wptResultPath = path.resolve(
  __dirname,
  '..',
  'node_modules',
  'webpagetest',
  'test',
  'fixtures',
  'responses',
  'testResults.json'
);
const wptResult = JSON.parse(fs.readFileSync(wptResultPath, 'utf8'));

describe('metricsFilter', () => {
  describe('#filterMetrics', () => {
    it('should filter a single metric', () => {
      const filtered = metricsFilter.filterMetrics(
        wptResult,
        'data.median.firstView.TTFB'
      );

      expect(filtered).to.deep.equal({
        data: { median: { firstView: { TTFB: 503 } } }
      });
    });

    it('should skip missing metric', () => {
      const filtered = metricsFilter.filterMetrics(
        wptResult,
        'data.median.firstView.TTTTTTFB'
      );

      expect(filtered).to.deep.equal({});
    });

    it('should filter multiple metrics', () => {
      const filtered = metricsFilter.filterMetrics(wptResult, [
        'data.median.firstView.TTFB',
        'data.median.repeatView.TTFB'
      ]);

      expect(filtered).to.deep.equal({
        data: {
          median: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          }
        }
      });
    });

    it('should filter with ending wildcard', () => {
      const filtered = metricsFilter.filterMetrics(wptResult, [
        'data.median.firstView.rawData.*'
      ]);

      expect(filtered).to.deep.equal({
        data: {
          median: {
            firstView: {
              rawData: {
                headers:
                  'http://www.webpagetest.org/results/14/11/06/8N/ZRC/1_report.txt',
                pageData:
                  'http://www.webpagetest.org/results/14/11/06/8N/ZRC/1_IEWPG.txt',
                requestsData:
                  'http://www.webpagetest.org/results/14/11/06/8N/ZRC/1_IEWTR.txt',
                utilization:
                  'http://www.webpagetest.org/results/14/11/06/8N/ZRC/1_progress.csv'
              }
            }
          }
        }
      });
    });

    it('should filter with wildcard', () => {
      const filtered = metricsFilter.filterMetrics(
        wptResult,
        'data.median.*.TTFB'
      );

      expect(filtered).to.deep.equal({
        data: {
          median: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          }
        }
      });
    });

    // Skip test case for now, since it doesn't work yet
    it('should filter for multiple sibling properties using wildcard', () => {
      const filtered = metricsFilter.filterMetrics(wptResult, [
        'data.median.*.TTFB',
        'data.median.*.loadTime'
      ]);

      expect(filtered).to.deep.equal({
        data: {
          median: {
            firstView: {
              TTFB: 503,
              loadTime: 1529
            },
            repeatView: {
              TTFB: 362,
              loadTime: 905
            }
          }
        }
      });
    });

    it('should filter with multiple wildcards', () => {
      const filtered = metricsFilter.filterMetrics(wptResult, 'data.*.*.TTFB');

      expect(filtered).to.deep.equal({
        data: {
          average: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          },
          standardDeviation: {
            firstView: { TTFB: 0 },
            repeatView: { TTFB: 0 }
          },
          median: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          }
        }
      });
    });

    it('should filter with starting wildcards', () => {
      const filtered = metricsFilter.filterMetrics(
        wptResult,
        '*.average.*.TTFB'
      );

      expect(filtered).to.deep.equal({
        data: {
          average: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          }
        }
      });
    });

    it('should filter with multiple starting wildcards', () => {
      const filtered = metricsFilter.filterMetrics(wptResult, '*.*.*.TTFB');

      expect(filtered).to.deep.equal({
        data: {
          average: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          },
          standardDeviation: {
            firstView: { TTFB: 0 },
            repeatView: { TTFB: 0 }
          },
          median: {
            firstView: { TTFB: 503 },
            repeatView: { TTFB: 362 }
          }
        }
      });
    });

    it('should filter with dots in json keys', () => {
      const data = {
        'a.b': {
          foo: 42
        },
        c: {
          foo: 17
        },
        'd.e.f': {
          foo: -1
        },
        g: 'foo'
      };

      const filtered = metricsFilter.filterMetrics(data, '*.foo');

      expect(filtered).to.deep.equal({
        'a.b': {
          foo: 42
        },
        c: {
          foo: 17
        },
        'd.e.f': {
          foo: -1
        }
      });
    });
  });
});
