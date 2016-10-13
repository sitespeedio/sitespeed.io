const log = require('intel');

module.exports = dataGenerator;

function dataGenerator(type) {
  const filters = {
  };

  if (type in filters) {
    return filters[type];
  }

  return (sender, timestamp, message) => {
    log.debug(`No custom data generator is available for ${type}`);
    sender.send(message);
  }
}

