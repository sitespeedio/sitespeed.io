module.exports = async function (context, commands) {
  try {
    const password = 'secret';
    await commands.navigate('https://en.wikipedia.org/');
    return commands.measure.start('https://en.wikipedia.org/wiki/Main_Page');
  } catch (error) {
    return error;
  }
};
