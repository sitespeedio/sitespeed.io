'use strict';
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');

const resultUrls = require('../lib/core/resultsStorage/resultUrls');
const messageMaker = require('../lib/support/messageMaker');
const filterRegistry = require('../lib/support/filterRegistry');
const intel = require('intel');
const statsHelpers = require('../lib/support/statsHelpers');

const coachRunPath = path.resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(fs.readFileSync(coachRunPath, 'utf8'));

const DataCollector = require('../lib/plugins/slack/dataCollector');

const defaultContextFactory = (context = {}) => {
  return Object.assign(
    {
      messageMaker,
      filterRegistry,
      intel,
      statsHelpers,
      resultUrls: resultUrls('', {})
    },
    context
  );
};

describe('slack', () => {
  describe('summary', () => {
    const getSummary = require('../lib/plugins/slack/summary');

    it('should not hard crash without a name', () => {
      const dataCollector = new DataCollector(defaultContextFactory());
      const options = {
        browsertime: {
          browser: 'mosaic',
          iterations: 5
        }
      };
      const codeUnderTest = () =>
        getSummary(dataCollector, [], resultUrls(), undefined, options);
      expect(codeUnderTest).to.not.throw();

      const summary = codeUnderTest();
      expect(summary.summaryText).to.have.string(
        '0 pages analysed for Unknown (5 runs, Mosaic/desktop/unknown)'
      );
    });

    it('should not hard crash with undefined browsertime options', () => {
      const dataCollector = new DataCollector(defaultContextFactory());
      const options = {
        browsertime: undefined
      };
      const codeUnderTest = () =>
        getSummary(dataCollector, [], resultUrls(), '<TEST NAME>', options);
      expect(codeUnderTest).to.not.throw();

      const summary = codeUnderTest();
      expect(summary.summaryText).to.have.string(
        '0 pages analysed for <TEST NAME> (0 runs, Unknown/desktop/unknown)'
      );
    });
  });

  describe('attachments', () => {
    const getAttachments = require('../lib/plugins/slack/attachements');

    it('should always return a list', () => {
      expect(getAttachments()).to.be.an('array').that.is.empty;
    });
  });

  describe('DataCollector', () => {
    it('should have an empty list of pages', () => {
      const context = defaultContextFactory();
      const collector = new DataCollector(context);
      expect(collector.getURLs()).to.be.an('array').that.is.empty;
    });

    it('add data should add new page URL', () => {
      const context = defaultContextFactory();
      const collector = new DataCollector(context);

      collector.addDataForUrl(
        'https://fake-site.sitespeed.io',
        'coach.run',
        { coach: { pageSummary: coachRun } },
        undefined
      );

      expect(collector.getURLs()).to.eql(['https://fake-site.sitespeed.io']);
    });
  });

  describe('index.open', () => {
    const plugin = require('../lib/plugins/slack');

    it('without any valid option', () => {
      const undefinedOptions = () => {
        plugin.open(defaultContextFactory(), undefined);
      };
      expect(undefinedOptions).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );

      const emptyOptions = () => {
        plugin.open(defaultContextFactory(), {});
      };
      expect(emptyOptions).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );

      const undefinedSlackOptions = () => {
        plugin.open(defaultContextFactory(), { slack: undefined });
      };
      expect(undefinedSlackOptions).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );

      const emptySlackOptions = () => {
        plugin.open(defaultContextFactory(), { slack: {} });
      };
      expect(emptySlackOptions).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );
    });

    it('should require userName with hookUrl option', () => {
      const codeUnderTest = () => {
        plugin.open(defaultContextFactory(), {
          hookUrl: 'https://fake-slack.sitespeed.io/hook'
        });
      };
      expect(codeUnderTest).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );
    });

    it('should require hookUrl with userName option', () => {
      const codeUnderTest = () => {
        plugin.open(defaultContextFactory(), {
          userName: 'Sitespeed.io'
        });
      };
      expect(codeUnderTest).to.throw(
        /^Required option\(s\) .+(hookUrl|userName).+ need to be specified in namespace "slack"$/
      );
    });

    it('should set plugin state for all valid options', () => {
      const options = Object.assign({}, plugin.config, {
        hookUrl: 'https://fake-slack.sitespeed.io/hook'
      });
      const context = defaultContextFactory();
      plugin.open(context, {
        slack: options
      });
      expect(plugin.options.slack).to.equal(options);
      expect(plugin.context).to.equal(context);
    });
  });

  describe('index.processMessage', () => {
    const Slack = require('node-slack');
    const realSend = Slack.prototype.send;

    function mockSend() {
      function mock() {
        mock.called = true;
        mock.callArgs = Array.from(arguments);
      }
      mock.called = false;
      mock.callArgs = [];
      Slack.prototype.send = mock;
      return mock;
    }

    function pluginFactory(context, extraOptions = {}) {
      const plugin = require('../lib/plugins/slack');

      const slackOptions = Object.assign({}, plugin.config, {
        hookUrl: 'https://fake-slack.sitespeed.io/hook'
      });
      const options = Object.assign(
        {
          slack: slackOptions,
          browsertime: {
            iterations: 1,
            browser: 'Chrome'
          }
        },
        extraOptions
      );
      plugin.open(context, options);
      plugin.processMessage({
        type: 'coach.pageSummary',
        url: 'http://fake-page.sitespeed.io/coach-run',
        data: coachRun,
        runIndex: undefined
      });
      return plugin;
    }

    afterEach(() => {
      Slack.prototype.send = realSend;
    });

    it('should send message for html.finished message without baseUrl', () => {
      const context = defaultContextFactory({
        name: 'Simple test'
      });
      const plugin = pluginFactory(context);
      const mock = mockSend();
      plugin.processMessage({ type: 'html.finished' });

      expect(mock.called).to.be.true;
      const params = mock.callArgs[0];
      expect(params.text).to.equal(
        '1 page analysed for Simple test (1 run, Chrome/desktop/unknown)\n*Site summary*\n\n'
      );
    });

    it('results URL should be part of the the report if baseUrl is provided', () => {
      const context = defaultContextFactory({
        name: 'Simple test'
      });
      context.resultUrls = resultUrls(
        'https://results.sitespeed.io/absolute/path',
        {}
      );
      const plugin = pluginFactory(context);
      const mock = mockSend();
      plugin.processMessage({ type: 'html.finished' });

      expect(mock.called).to.be.true;
      const params = mock.callArgs[0];
      expect(params.text).to.equal(
        '1 page analysed for Simple test (1 run, Chrome/desktop/unknown)\n*Site summary* ' +
          '(<https://results.sitespeed.io/absolute/path/index.html |result>)\n\n'
      );
    });

    it('should not send message for html.finished with s3 configured', () => {
      const context = defaultContextFactory({
        name: 'S3 configured'
      });
      const plugin = pluginFactory(context, {
        s3: { bucketname: 'sitespeed_data_bucket' }
      });

      const mock = mockSend();
      expect(Slack.prototype.send).to.equal(mock);

      plugin.processMessage({ type: 'html.finished' });
      expect(mock.called).to.be.false;

      plugin.processMessage({ type: 's3.finished' });
      expect(mock.called).to.be.true;
      expect(mock.callArgs[0].text).to.equal(
        '1 page analysed for S3 configured (1 run, Chrome/desktop/unknown)\n*Site summary*\n\n'
      );
    });

    it('should not send message for html.finished with gcs configured', () => {
      const context = defaultContextFactory({
        name: 'GCS'
      });
      const plugin = pluginFactory(context, {
        gcs: {
          bucketname: 'sitespeed_data_bucket',
          projectId: 123456789,
          key: 'sitespeed-1234567890'
        }
      });

      const mock = mockSend();
      expect(Slack.prototype.send).to.equal(mock);

      plugin.processMessage({ type: 'html.finished' });
      expect(mock.called).to.be.false;

      plugin.processMessage({ type: 'gcs.finished' });
      expect(mock.called).to.be.true;
      expect(mock.callArgs[0].text).to.equal(
        '1 page analysed for GCS (1 run, Chrome/desktop/unknown)\n*Site summary*\n\n'
      );
    });
  });
});
