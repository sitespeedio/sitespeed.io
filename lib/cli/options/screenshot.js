import { config as browsertimeConfig } from '../../plugins/browsertime/index.js';

export function addOptions(yargs) {
  yargs
    .option('browsertime.screenshotLCP', {
      alias: 'screenshotLCP',
      type: 'boolean',
      default: true,
      describe:
        'Save one screenshot per iteration that shows the largest contentful paint element (if the browser supports LCP).',
      group: 'Screenshot'
    })
    .option('browsertime.screenshotLS', {
      alias: 'screenshotLS',
      type: 'boolean',
      default: true,
      describe:
        'Save one screenshot per iteration that shows the layout shift elements (if the browser supports layout shift).',
      group: 'Screenshot'
    })
    .option('browsertime.screenshot', {
      type: 'boolean',
      describe: 'Set to false to disable screenshots',
      default: true,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.type', {
      alias: 'screenshot.type',
      describe: 'Set the file type of the screenshot',
      choices: ['png', 'jpg'],
      default: browsertimeConfig.screenshotParams.type,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.jpg.quality', {
      alias: 'screenshot.jpg.quality',
      describe: 'Quality of the JPEG screenshot. 1-100',
      default: browsertimeConfig.screenshotParams.jpg.quality,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.maxSize', {
      alias: 'screenshot.maxSize',
      describe: 'The max size of the screenshot (width and height).',
      default: browsertimeConfig.screenshotParams.maxSize,
      group: 'Screenshot'
    });
}
