import { run as _run } from '../lib/sitespeed.js';
const urls = ['http://127.0.0.1:3001/simple/'];

async function run() {
  try {
    let result = await _run({
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
      console.error(result.errors);

      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  } catch (error) {
    console.error(error);

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

await run();
