const sitespeed = require('../lib/sitespeed');
const expect = require('chai').expect;

describe("Sitespeed run without CLI", function(){
  it("should capture the budget plugin correctly when budget config is passed", function(done){
    const options = {
      "urls": ["http://www.google.com"],
      "browsertime": {
        "iterations": 1
      },

      "budget": {
        "config": {
          "browsertime.pageSummary": [{
            "metric": "statistics.timings.firstPaint.median",
            "max": 10
          }, {
            "metric": "statistics.visualMetrics.FirstVisualChange.median",
            "max": 10
          }]
        }
      }

    };
    sitespeed.run(options).then(function(results){
      expect(results.budgetResult.failing).to.include.keys('http://www.google.com');
      done();
    });
  }).timeout(15000);
  it("should capture the budget plugin correctly when budget configPath is passed", function(done){
    const options = {
      "urls": ["http://www.google.com"],
      "browsertime": {
        "iterations": 1
      },

      "budget": {
        "configPath": __dirname + '/budget.json'
      }

    };
    sitespeed.run(options).then(function(results){
      expect(results.budgetResult.failing).to.include.keys('http://www.google.com');
      done();
    });
  }).timeout(15000);
})
