import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { DomainsAggregator } from './aggregator.js';
import { isEmpty } from '../../support/util.js';

export default class DomainsPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'domains', options, context, queue });
  }

  open(context) {
    this.make = context.messageMaker('domains').make;
    // '*.requestCounts, 'domains.summary'
    context.filterRegistry.registerFilterForType([], 'domains.summary');
    this.browsertime = false;
    this.domainsAggregator = new DomainsAggregator();
  }
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        this.browsertime = true;
        break;
      }

      case 'browsertime.har': {
        this.domainsAggregator.addToAggregate(message.data, message.url);
        break;
      }

      case 'sitespeedio.summarize': {
        const summary = this.domainsAggregator.summarize();
        if (!isEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('domains.summary', summary.groups[group], { group })
            );
          }
        }
        break;
      }
    }
  }
}
