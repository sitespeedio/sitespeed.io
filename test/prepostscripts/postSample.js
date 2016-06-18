module.exports = {
    run(context) {
      context.log.info('In posttask!!! (with results: ' + JSON.stringify(context.results) + ')');
    }
  };
