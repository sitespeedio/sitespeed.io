'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
    this.log = context.intel.getLogger('sitespeedio.plugin.green');
    this.make = context.messageMaker('green').make;
    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.har':
      case 'webpagetest.har': {
        // We got a HAR file that we an use to calculate size or use domains.
        // When the plugin is finished I think we want to send three different messages:
        // * .run is the data for each run. We can get that by iterate over all pages in the HAR
        // and calculate the data we want
        // *.pageSummary is the summary of all runs. It can be that the server serves different content etc
        // *.summary is for all tested URLs. This can be interesting if you test multiple pages for site
        let runIndex = 0;
        for (let run of message.data.log.pages) {
          queue.postMessage(
            make(
              'green.run',
              {}, // Here we put the data that we got from that run
              { url: message.url, group: message.group, runIndex }
            )
          );
          runIndex++;
        }
        queue.postMessage(
          make(
            'green.pageSummary',
            {}, // Here we put the data from the summary of all runs
            {
              url: message.url,
              group: message.group
            }
          )
        );
        break;
      }

      case 'sitespeedio.setup': {
        queue.postMessage(make('green.setup'));
        // Add the HTML pugs
        queue.postMessage(
          make('html.pug', {
            id: 'green',
            name: 'Green',
            pug: this.pug,
            type: 'pageSummary'
          })
        );
        queue.postMessage(
          make('html.pug', {
            id: 'green',
            name: 'Green',
            pug: this.pug,
            type: 'run'
          })
        );
        break;
      }
    }
  }
};
