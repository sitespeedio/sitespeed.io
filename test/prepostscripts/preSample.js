module.exports = {
  run(context) {
    context.log.info('In pretask!!!');
    if (!context.taskData.loadedSitespeed) {
      return context.runWithDriver((driver) => {
          return driver.get('https://www.sitespeed.io')
            .then(() => driver.getTitle())
            .then((title) => {
              context.log.info('Loaded page with title: ' + title);
            });
        })
        .then(() => {
          context.taskData.loadedSitespeed = true;
        });
    }
  }
};
