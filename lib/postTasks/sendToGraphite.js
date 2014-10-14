var Graphite = require('../graphite');

exports.task = function(result, config, cb) {
  if (config.graphiteHost) {
    var graphite = new Graphite(config.graphiteHost, config.graphitePort, config
      .graphiteNamespace, config);

    graphite.sendPageData(result.aggregates, result.pages, config, cb);
  } else {
    cb();
  }

};