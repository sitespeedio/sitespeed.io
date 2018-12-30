module.exports = async function(context) {
  context.log.info('In pretask!!!');
  await context.h.navigate('https://www.sitespeed.io/');
  context.taskData.loadedSitespeed = true;
};
