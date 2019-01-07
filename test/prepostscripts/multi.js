module.exports = async function(context, commands) {
  await commands.measure.startAndNavigate('https://www.sitespeed.io');
  await commands.measure.startAndNavigate('https://www.sitespeed.io/examples/');
  return commands.measure.startAndNavigate(
    'https://www.sitespeed.io/documentation/'
  );
};
