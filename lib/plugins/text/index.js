import merge from 'lodash.merge';

import { renderSummary, renderBriefSummary } from './textBuilder.js';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { setProperty } from '../../support/util.js';

export default class TextPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'text', options, context, queue });
  }
  open(context, options) {
    this.metrics = {};
    this.options = options;
    this.context = context;
  }
  processMessage(message) {
    if (message.type.endsWith('.summary')) {
      const data = {};
      setProperty(data, message.type, message.data);
      merge(this.metrics, data);
    }
  }
  close(options) {
    if (!options.summary) return;
    const renderer = this.options.summaryDetail
      ? renderSummary
      : renderBriefSummary;
    return renderer(this.metrics, this.context, options);
  }
}
