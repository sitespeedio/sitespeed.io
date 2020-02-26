'use strict';
const tgwf = require('@tgwf/co2');
const co2 = tgwf.co2;
const hosting = tgwf.hosting;

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const pagexray = require('pagexray');
const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

Promise.promisifyAll(fs);
const expect = chai.expect;

describe('sustainableWeb', function () {
  describe('co2', function () {
    let har;
    const GREY_VALUE = 0.8193815884799998;
    // onst GREEN_VALUE = 0.54704300112;
    const MIXED_VALUE = 0.57128033088;

    beforeEach(function () {
      return fs
        .readFileAsync(
          path.resolve(
            __dirname,
            'fixtures',
            'www-thegreenwebfoundation-org.har'
          ),
          'utf8'
        )
        .then(JSON.parse)
        .tap(data => {
          har = data;
        });
    });

    describe('perByte', function () {
      const MILLION = 1000000;
      it("returns a CO2 number for data transfer using 'grey' power", function () {
        expect(co2.perByte(MILLION)).to.be.a('number');
        expect(co2.perByte(MILLION)).to.equal(1.1625599999999998);
      });
      it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", function () {
        expect(co2.perByte(MILLION, true)).to.be.a('number');
        expect(co2.perByte(MILLION, true)).to.be.below(1.1625599999999998);
        expect(co2.perByte(MILLION, true)).to.be.equal(0.77616);
      });
    });

    describe('perPage', function () {
      it('returns CO2 for total transfer for page', function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];



        expect(co2.perPage(pageXrayRun)).to.be.equal(GREY_VALUE);
      });
      it('returns lower CO2 for page served from green site', function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        let green = [
          'www.thegreenwebfoundation.org',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'assets.digitalclimatestrike.net',
          'cdnjs.cloudflare.com',
          'graphite.thegreenwebfoundation.org',
          'analytics.thegreenwebfoundation.org',
          'fonts.gstatic.com',
          'api.thegreenwebfoundation.org'
        ];
        expect(co2.perPage(pageXrayRun, green)).to.be.below(GREY_VALUE);
      });
      it('returns a lower CO2 number where *some* domains use green power', function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        // green can be true, or a array containing entries
        let green = [
          'www.thegreenwebfoundation.org',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'assets.digitalclimatestrike.net',
          'cdnjs.cloudflare.com',
          'graphite.thegreenwebfoundation.org',
          'analytics.thegreenwebfoundation.org',
          'fonts.gstatic.com',
          'api.thegreenwebfoundation.org'
        ];
        expect(co2.perPage(pageXrayRun, green)).to.be.equal(MIXED_VALUE);
      });
    });
    describe('perDomain', function () {
      it('shows object listing Co2 for each domain', function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];
        // console.log(Object.keys(pageXrayRun.domains))
        const res = co2.perDomain(pageXrayRun);
        // console.log(res)
        const domains = [
          'thegreenwebfoundation.org',
          'www.thegreenwebfoundation.org',
          'maxcdn.bootstrapcdn.com',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'assets.digitalclimatestrike.net',
          'cdnjs.cloudflare.com',
          'graphite.thegreenwebfoundation.org',
          'analytics.thegreenwebfoundation.org',
          'fonts.gstatic.com',
          'api.thegreenwebfoundation.org'
        ];
        expect(res).to.be.a('array');
        expect(res.length).to.equal(domains.length);

        Object.values(res).forEach(function (val) {
          expect(val.co2).to.be.a('number');
        });
      });
      it('shows lower Co2 for green domains', function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        const greenDomains = [
          'www.thegreenwebfoundation.org',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'assets.digitalclimatestrike.net',
          'cdnjs.cloudflare.com',
          'graphite.thegreenwebfoundation.org',
          'analytics.thegreenwebfoundation.org',
          'fonts.gstatic.com',
          'api.thegreenwebfoundation.org'
        ];
        const res = co2.perDomain(pageXrayRun);
        const resWithGreen = co2.perDomain(pageXrayRun, greenDomains);
        const sumRes = res.reduce(function (a, b) {
          return a + b.co2;
        }, 0);
        const sumResWithGreen = resWithGreen.reduce(function (a, b) {
          return a + b.co2;
        }, 0);

        expect(sumResWithGreen).to.be.below(sumRes);
      });
    });
    describe('perContentType', function () {
      it('shows a breakdown of emissions by content type', function () { });
    });
    describe('dirtiestResources', function () {
      it('shows the top 10 resources by CO2 emissions');
    });
  });

  describe('hosting', function () {
    let har;
    beforeEach(function () {
      return fs
        .readFileAsync(
          path.resolve(
            __dirname,
            'fixtures',
            'www-thegreenwebfoundation-org.har'
          ),
          'utf8'
        )
        .then(JSON.parse)
        .tap(data => {
          har = data;
        });
    });

    describe('greenDomains', async function () {
      it('it returns a list of green domains, when passed a page object', async function () {
        const pages = pagexray.convert(har);
        const pageXrayRun = pages[0];

        // TODO find a way to not hit the API each time
        const greenDomains = await hosting.checkPage(pageXrayRun);

        expect(greenDomains)
          .to.be.an('array')
          .of.length(10);

        const expectedGreendomains = [
          'thegreenwebfoundation.org',
          'www.thegreenwebfoundation.org',
          'fonts.googleapis.com',
          'ajax.googleapis.com',
          'assets.digitalclimatestrike.net',
          'cdnjs.cloudflare.com',
          'graphite.thegreenwebfoundation.org',
          'analytics.thegreenwebfoundation.org',
          'fonts.gstatic.com',
          'api.thegreenwebfoundation.org'
        ];
        greenDomains.forEach(function (dom) {
          expect(expectedGreendomains).to.include(dom);
        });
      });
      it(
        'it returns an empty list, when passed a page object with no green domains'
      );
    });
  });
});
