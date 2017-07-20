'use strict';

const DataGenerator = require('../lib/plugins/influxdb/data-generator'),
  moment = require('moment'),
  expect = require('chai').expect;

describe('influxdb', function() {
  describe('dataGenerator', function() {
    it('should generate data for coach.summary', function() {
      const message = {
        uuid: '33774328-e781-4152-babe-a367cee27153',
        type: 'coach.summary',
        timestamp: '2017-04-04T09:55:59+02:00',
        source: 'coach',
        data: {
          score: {
            median: '96',
            mean: '96',
            min: '96',
            p90: '96',
            max: '96'
          },
          accessibility: {
            score: {
              median: '95',
              mean: '95',
              min: '95',
              p90: '95',
              max: '95'
            },
            altImages: {
              median: '80',
              mean: '80',
              min: '80',
              p90: '80',
              max: '80'
            },
            headings: {
              median: '90',
              mean: '90',
              min: '90',
              p90: '90',
              max: '90'
            },
            labelOnInput: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            landmarks: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            neverSuppressZoom: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            sections: {
              median: '0',
              mean: '0',
              min: '0',
              p90: '0',
              max: '0'
            },
            table: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            }
          },
          bestpractice: {
            score: {
              median: '85',
              mean: '85',
              min: '85',
              p90: '85',
              max: '85'
            },
            charset: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            doctype: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            https: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            httpsH2: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            language: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            metaDescription: {
              median: '50',
              mean: '50',
              min: '50',
              p90: '50',
              max: '50'
            },
            optimizely: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            pageTitle: {
              median: '50',
              mean: '50',
              min: '50',
              p90: '50',
              max: '50'
            },
            spdy: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            url: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            }
          },
          performance: {
            score: {
              median: '98',
              mean: '98',
              min: '98',
              p90: '98',
              max: '98'
            },
            avoidScalingImages: {
              median: '50',
              mean: '50',
              min: '50',
              p90: '50',
              max: '50'
            },
            cssPrint: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            fastRender: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            inlineCss: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            jquery: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            spof: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            thirdPartyAsyncJs: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            assetsRedirects: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            cacheHeaders: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            cacheHeadersLong: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            compressAssets: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            connectionKeepAlive: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            cssSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            documentRedirect: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            favicon: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            fewFonts: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            fewRequestsPerDomain: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            headerSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            imageSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            javascriptSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            mimeTypes: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            optimalCssSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            pageSize: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            privateAssets: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            },
            responseOk: {
              median: '100',
              mean: '100',
              min: '100',
              p90: '100',
              max: '100'
            }
          }
        },
        group: 'www.sitespeed.io'
      };

      let generator = new DataGenerator(false, {
        _: ['filename'],
        browser: 'chrome',
        connectivity: 'cable',
        influxdb: {
          tags: 'tool=sitespeed.io'
        }
      });

      var data = generator.dataFromMessage(message, moment());

      expect(data).to.not.be.empty;

      const seriesName = data[0].seriesName;
      const numberOfTags = Object.keys(data[0].tags).length;
      expect(seriesName).to.match(/score/);
      expect(numberOfTags).to.equal(6);
    });
  });
});
