'use strict';
const path = require('path');
const fs = require('fs');
const log = require('intel').getLogger('sitespeedio.plugin.axe');

module.exports = {
  open(context, options) {
    this.options = options;
    this.make = context.messageMaker('axe').make;
    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    log.info('Axe plugin activated');
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        queue.postMessage(
          make('browsertime.config', {
            postURLScript: path.resolve(__dirname, 'axePostScript.js')
          })
        );
        break;
      }
      case 'axe.run': {
        break;
      }

      case 'sitespeedio.setup': {
        // Tell other plugins that axe will run
        queue.postMessage(make('axe.setup'));

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
};
