'use strict';
const util = require('util'),
  h = require('../../support/helpers');

module.exports = {
  get(dataCollection, options, errors) {

    let summaryText = 'Tested ' + `${h.plural(Object.keys(dataCollection.urlPages).length,'page')} analyzed for ${h.short(options._[0], 30)} ` +
      `(${h.plural(options.browsertime.iterations, 'run')}, ` +
      `${h.cap(options.browsertime.browser)}/${options.mobile ? 'mobile' : 'desktop'}/${options.connectivity})\n`;

    summaryText += '*Summary*\n*FirstPaint*: ' + dataCollection.summaryPages.index.browsertime.summary.firstPaint.median
    summaryText += '\n*Coach score*: ' + dataCollection.summaryPages.index.coach.summary.performance.score.median;
    summaryText += '\n*Transfer size*:' + h.size.format(dataCollection.summaryPages.index.pagexray.summary.transferSize.median);

    let logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png';
    if (dataCollection.summaryPages.index.coach.summary.performance.score.median === 100) {
      logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-100';
    }

    let errorText = '';
    if (errors.length > 0) {
      errorText += util.format(' (%d) errors', errors.length);
      logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-hm.png';
    }

    return {
      summaryText,
      errorText,
      logo
    };
  }
}
