Stats = require('fast-stats').Stats;

function DomainTiming(time, url, pageUrl) {
  this.stats = new Stats().push(time);
  this.maxTimeUrl = url;
  this.maxTimePageUrl = pageUrl;
};

DomainTiming.prototype.add = function(time, url, pageUrl) {
  if (time > this.stats.max) {
    this.maxTimeUrl = url;
    this.maxTimePageUrl = pageUrl;
  }
  this.stats.push(time);
};

DomainTiming.prototype.stats = function() {
  return this.stats;
}

module.exports = DomainTiming;