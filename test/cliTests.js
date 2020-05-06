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
      expect(stdout).to.contain(
        'The Grafana auth/bearer value used when sending annotations to Grafana. See http://docs.grafana.org/http_api/auth/#authentication-api'
      );

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
  });
});
