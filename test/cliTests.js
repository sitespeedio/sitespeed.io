'use strict';

const expect = require('chai').expect;
const path = require('path');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

function runSitespeed(options = []) {
  const cli = path.join(path.resolve(__dirname), '../bin/sitespeed.js');
  return execFile('node', [cli].concat(options));
}

describe('cli', () => {
  context('no arguments', () => {
    it('should report error', async () => {
      let stderr;
      let exitCode = 0;
      try {
        await runSitespeed();
      } catch (err) {
        stderr = err.stderr;
        exitCode = err.code;
      }
      expect(stderr).not.to.be.undefined;
      expect(exitCode).not.to.equal(0);
      expect(stderr).to.include('sitespeed.js [options] <url>/<file>');
      expect(stderr).to.include('One or multiple URLs or scripts');
    });
  });

  describe('--help summary', async () => {
    let stdout;

    before(async () => {
      const run = await runSitespeed(['--help']);
      stdout = run.stdout;
    });

    it('should include banner in stdout with --help and not hard exit', async () => {
      expect(stdout).not.to.be.undefined;
      expect(stdout).to.include('sitespeed.js [options] <url>/<file>');
      expect(stdout).to.not.include('One or multiple URLs or scripts');
    });

    it('should contain grafana options', () => {
      expect(stdout).to.contain('--grafana.host');
      expect(stdout).to.contain(
        'The Grafana host used when sending annotations'
      );

      expect(stdout).to.contain('--grafana.port');
      expect(stdout).to.contain(
        'The Grafana port used when sending annotations to Grafana'
      );

      expect(stdout).to.contain('--grafana.auth');
      expect(stdout).to.contain('--grafana.annotationTitle');
      expect(stdout).to.contain(
        'Add a title to the annotation sent for a run.'
      );

      expect(stdout).to.contain('--grafana.annotationMessage');
      expect(stdout).to.contain(
        'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.'
      );

      expect(stdout).to.contain('--grafana.annotationTag');
      expect(stdout).to.contain(
        'Add a extra tag to the annotation sent for a run. Repeat the --grafana.annotationTag option for multiple tags. Make sure they do not collide with the other tags.'
      );

      expect(stdout).to.contain('--grafana.annotationScreenshot');
      expect(stdout).to.contain(
        'Include screenshot (from Browsertime/WebPageTest) in the annotation. You need to specify a --resultBaseURL for this to work.'
      );
    });

    it('should contain graphite options', () => {
      expect(stdout).to.contain('--graphite.host');
      expect(stdout).to.contain(
        'The Graphite host used to store captured metrics.'
      );

      expect(stdout).to.contain('--graphite.port');
      expect(stdout).to.contain(
        'The Graphite port used to store captured metrics.'
      );

      expect(stdout).to.contain('--graphite.auth');
      expect(stdout).to.contain(
        'The Graphite user and password used for authentication. Format: user:password'
      );

      expect(stdout).to.contain('--graphite.httpPort');
      expect(stdout).to.contain(
        'The Graphite port used to access the user interface and send annotations event'
      );

      expect(stdout).to.contain('--graphite.webHost');
      expect(stdout).to.contain(
        'The graphite-web host. If not specified graphite.host will be used.'
      );

      expect(stdout).to.contain('--graphite.namespace');
      expect(stdout).to.contain(
        'The namespace key added to all captured metrics.'
      );

      expect(stdout).to.contain('--graphite.includeQueryParams');
      expect(stdout).to.contain(
        'Whether to include query parameters from the URL in the Graphite keys or not'
      );

      expect(stdout).to.contain('--graphite.arrayTags');
      expect(stdout).to.contain(
        'Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String'
      );

      expect(stdout).to.contain('--graphite.annotationTitle');
      expect(stdout).to.contain(
        'Add a title to the annotation sent for a run.'
      );

      expect(stdout).to.contain('--graphite.annotationMessage');
      expect(stdout).to.contain(
        'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.'
      );

      expect(stdout).to.contain('--graphite.annotationScreenshot');
      expect(stdout).to.contain(
        'Include screenshot (from Browsertime/WebPageTest) in the annotation. You need to specify a --resultBaseURL for this to work.'
      );

      expect(stdout).to.contain('--graphite.statsd');
      expect(stdout).to.contain('Uses the StatsD interface');

      expect(stdout).to.contain('--graphite.annotationTag');
      expect(stdout).to.contain(
        'Add a extra tag to the annotation sent for a run. Repeat the --graphite.annotationTag option for multiple tags. Make sure they do not collide with the other tags.'
      );

      expect(stdout).to.contain('--graphite.bulkSize');
      expect(stdout).to.contain(
        'Break up number of metrics to send with each request.'
      );

      expect(stdout).to.contain('--graphite.perIteration');
      expect(stdout).to.contain(
        'Send each iteration of metrics to Graphite. By default we only send page summaries (the summaries of all runs) but you can also send all the runs. Make sure to setup statsd or Graphite correctly to handle it.'
      );
    });

    it('should contain influxdb options', () => {
      expect(stdout).to.contain('--influxdb.protocol');
      expect(stdout).to.contain('--influxdb.host');
      expect(stdout).to.contain('--influxdb.port');
      expect(stdout).to.contain('--influxdb.username');
      expect(stdout).to.contain('--influxdb.database');
      expect(stdout).to.contain('--influxdb.includeQueryParams');
      expect(stdout).to.contain('--influxdb.groupSeparator');
      expect(stdout).to.contain('--influxdb.annotationScreenshot');
    });
  });
});
