module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3001/simple/');
  await commands.measure.start('http://127.0.0.1:3001/dimple/');
  return commands.measure.start('http://127.0.0.1:3001/search/');
};
