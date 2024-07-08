import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import intel from 'intel';
import axe from 'axe-core';
const { version: axeVersion } = axe;
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
const log = intel.getLogger('sitespeedio.plugin.axe');
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default class AxePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'axe', options, context, queue });
  }

  open(context, options) {
    this.options = options;
    this.make = context.messageMaker('axe').make;
    this.pug = readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    log.info(`Axe version %s plugin activated`, axeVersion);
  }

  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        queue.postMessage(
          make('browsertime.config', {
            postURLScript: path.resolve(__dirname, 'axePostScript.cjs')
          })
        );
        break;
      }
      case 'axe.run': {
        break;
      }

      case 'sitespeedio.setup': {
        // Tell other plugins that axe will run
        queue.postMessage(make('axe.setup', { version: axeVersion }));

        // Add the HTML pugs
        queue.postMessage(
          make('html.pug', {
            id: 'axe',
            name: 'axe',
            pug: this.pug,
            type: 'pageSummary'
          })
        );
        queue.postMessage(
          make('html.pug', {
            id: 'axe',
            name: 'axe',
            pug: this.pug,
            type: 'run'
          })
        );
        break;
      }
    }
  }
}
