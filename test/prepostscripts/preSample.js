module.exports = async function (context, commands) {
  context.log.info('In pretask!!!');
  await commands.navigate('http://127.0.0.1:3001/simple/');
  context.taskData.loadedSitespeed = true;
};
