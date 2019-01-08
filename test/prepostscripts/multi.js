module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.measure.start('https://www.sitespeed.io/examples/');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
