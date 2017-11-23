const sitespeed = require('../lib/sitespeed');
const urls = ['https://www.sitespeed.io/'];

function run() {
  sitespeed
    .run({
      urls,
      browsertime: {
        iterations: 1,
        browser: 'chrome',
        connectivity: {
          profile: 'native'
        }
      }
    })
    .then(results => {
      if (results.error) {
        throw new Error(results.error);
      }
    })
    .catch(err => {
      /* eslint-disable no-console */
      console.error(err);
      /* eslint-enable no-console */
      process.exit(1);
    });
}

run();
