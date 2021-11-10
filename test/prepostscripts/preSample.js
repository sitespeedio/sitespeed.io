module.exports = async function (context, commands) {
  context.log.info('In pretask!!!');
  await commands.navigate('https://www.sitespeed.io/');
  context.taskData.loadedSitespeed = true;
};
