const sitespeed = require('../lib/sitespeed');
const urls = ['https://www.sitespeed.io/'];

async function run() {
  try {
    let result = await sitespeed.run({
      urls,
      browsertime: {
        iterations: 1,
        browser: 'chrome',
        connectivity: {
          profile: 'native'
        },
        headless: true
      }
    });

    if (result.errors.length > 0) {
      /* eslint-disable no-console */
      console.error(result.errors);
      /* eslint-enable no-console */
      process.exit(1);
    }
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e);
    /* eslint-enable no-console */
    process.exit(1);
  }
}

run();
