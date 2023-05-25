module.exports = async function (context, commands) {
    return commands.measure.start('https://www.sitespeed.io/');
};
