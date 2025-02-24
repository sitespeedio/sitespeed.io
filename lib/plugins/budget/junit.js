import path from 'node:path';
import fs from 'node:fs';
import merge from 'lodash.merge';
import { getLogger } from '@sitespeed.io/log';

const log = getLogger('sitespeedio.plugin.budget');

/**
 * Escapes XML special characters.
 *
 * @param {string} str - The text to escape.
 * @returns {string} The escaped text.
 */
function xmlEscape(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Wraps a string in a CDATA block.
 *
 * @param {string} str - The string to wrap.
 * @returns {string} The CDATA-wrapped string.
 */
function cdata(str) {
  return `<![CDATA[${str}]]>`;
}

/**
 * Writes a JUnit XML report mimicking the original output.
 *
 * @param {object} results - Object containing `failing` and `working` results.
 * @param {string} dir - Directory where `junit.xml` will be written.
 * @param {object} options - Options (expects `options.budget.friendlyName`).
 */
export function writeJunit(results, dir, options) {
  const failing = results.failing || {};
  const working = results.working || {};
  const urls = Object.keys(merge({}, failing, working));

  let totalTests = 0;
  let totalFailures = 0;
  let suitesXml = '';

  for (const url of urls) {
    const suiteName = `${options.budget.friendlyName || 'sitespeed.io'}.${url}`;
    let suiteTests = 0;
    let suiteFailures = 0;
    let testCasesXml = '';

    if (failing[url]) {
      for (const result of failing[url]) {
        suiteTests++;
        totalTests++;
        suiteFailures++;
        totalFailures++;
        const testCaseName = `${result.type}.${result.metric}`;
        const failureMessage = `${result.metric} is ${result.friendlyValue || result.value}`;
        testCasesXml += `    <testcase classname="${xmlEscape(url)}" name="${xmlEscape(testCaseName)}">\n`;
        testCasesXml += `      <failure message="${xmlEscape(failureMessage)}"/>\n`;
        testCasesXml += `    </testcase>\n`;
      }
    }

    if (working[url]) {
      for (const result of working[url]) {
        suiteTests++;
        totalTests++;
        const testCaseName = `${result.type}.${result.metric}`;
        const systemOutMessage = `${result.metric} is ${result.friendlyValue || result.value}`;
        testCasesXml += `    <testcase classname="${xmlEscape(url)}" name="${xmlEscape(testCaseName)}">\n`;
        testCasesXml += `      <system-out>${cdata(systemOutMessage)}</system-out>\n`;
        testCasesXml += `    </testcase>\n`;
      }
    }

    suitesXml += `  <testsuite name="${xmlEscape(suiteName)}" tests="${suiteTests}" failures="${suiteFailures}" errors="0" skipped="0">\n`;
    suitesXml += testCasesXml;
    suitesXml += `  </testsuite>\n`;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuites tests="${totalTests}" failures="${totalFailures}" errors="0" skipped="0">\n` +
    suitesXml +
    `</testsuites>\n`;

  const file = path.join(dir, 'junit.xml');
  log.info('Write junit budget to %s', path.resolve(file));
  fs.writeFileSync(file, xml);
}
