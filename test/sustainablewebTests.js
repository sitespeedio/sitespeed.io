"use strict"
const co2 = require("../lib/plugins/sustainable/co2")

const fs = require("fs")
const path = require("path")
const Promise = require("bluebird")
const pagexray = require("pagexray")

Promise.promisifyAll(fs)

const expect = require("chai").expect

describe("sustainableWeb", function() {
  describe("co2", function() {
    let har

    beforeEach(function() {
      return fs
        .readFileAsync(
          path.resolve(
            __dirname,
            "fixtures",
            "www-thegreenwebfoundation-org.har"
          ),
          "utf8"
        )
        .then(JSON.parse)
        .tap(data => {
          har = data
        })
    })

    describe("perByte", function() {
      it("returns a CO2 number for data transfer using 'grey' power", function() {
        expect(co2.perByte(1_000_000)).to.be.a("number")
        expect(co2.perByte(1_000_000)).to.equal(1.1625599999999998)
      })
      it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", function() {
        expect(co2.perByte(1_000_000, true)).to.be.a("number")
        expect(co2.perByte(1_000_000, true)).to.be.below(1.1625599999999998)
        expect(co2.perByte(1_000_000, true)).to.be.equal(0.77616)
      })
    })

    describe("perPage", function() {
      it("returns CO2 for total transfer for page", function() {
        const pages = pagexray.convert(har)
        const pageXrayRun = pages[0]

        expect(co2.perPage(pageXrayRun)).to.be.equal(0.8193804259199999)
      })
      it("returns lower CO2 for page served from green site", function() {
        const pages = pagexray.convert(har)
        const pageXrayRun = pages[0]
        let green = true
        expect(co2.perPage(pageXrayRun, green)).to.be.equal(0.54704300112)
      })
      it("returns a lower CO2 number where *some* domains use green power", function() {})
    })
    describe("perDomain", function() {
      it("shows object listing Co2 for each domain", function() {
        const pages = pagexray.convert(har)
        const pageXrayRun = pages[0]
        // console.log(Object.keys(pageXrayRun.domains))
        const res = co2.perDomain(pageXrayRun)
        // console.log(res)
        const domains = [
          "thegreenwebfoundation.org",
          "www.thegreenwebfoundation.org",
          "maxcdn.bootstrapcdn.com",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org"
        ]
        expect(res).to.be.a("object")
        expect(Object.keys(res)).to.deep.equal(domains)

        Object.values(res).forEach(function(val) {
          expect(val).to.be.a("number")
        })
      })
      it("shows lower Co2 for green domains", function() {
        const pages = pagexray.convert(har)
        const pageXrayRun = pages[0]

        const greenDomains = [
          "www.thegreenwebfoundation.org",
          "fonts.googleapis.com",
          "ajax.googleapis.com",
          "assets.digitalclimatestrike.net",
          "cdnjs.cloudflare.com",
          "graphite.thegreenwebfoundation.org",
          "analytics.thegreenwebfoundation.org",
          "fonts.gstatic.com",
          "api.thegreenwebfoundation.org"
        ]
        const res = co2.perDomain(pageXrayRun)
        const resWithGreen = co2.perDomain(pageXrayRun, greenDomains)
        greenDomains.forEach(function(domain) {
          expect(resWithGreen[domain]).to.be.below(res[domain])
        })
      })
    })
  })
})
