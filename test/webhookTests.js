import { createServer } from 'node:http';

import test from 'ava';

import WebhookPlugin from '../lib/plugins/webhook/index.js';
import { send } from '../lib/plugins/webhook/send.js';
import { resultUrls } from '../lib/core/resultsStorage/resultUrls.js';

// Answer with the given status codes in order and keep every request body
async function startServer(statusCodes) {
  const bodies = [];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', chunk => (body += chunk));
    request.on('end', () => {
      bodies.push({ url: request.url, body: JSON.parse(body) });
      response.statusCode = statusCodes.shift() ?? 200;
      response.end();
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/hook?token=abc`;
  return { url, bodies, close: () => server.close() };
}

test('send retries a 503 and keeps the query string', async t => {
  const server = await startServer([503, 200]);
  await send(server.url, { hello: 'world' });
  server.close();

  t.is(server.bodies.length, 2);
  t.is(server.bodies[1].url, '/hook?token=abc');
  t.deepEqual(server.bodies[1].body, { hello: 'world' });
});

test('send does not retry a 400', async t => {
  const server = await startServer([400]);
  await t.throwsAsync(() => send(server.url, {}), { message: /400/ });
  server.close();

  t.is(server.bodies.length, 1);
});

test('the plugin posts the result of the run when it closes', async t => {
  const server = await startServer([]);
  const options = { webhook: { url: server.url }, name: 'My test' };
  const context = {
    messageMaker: () => ({ make: () => {} }),
    getLogger: () => {},
    resultUrls: resultUrls('https://results.example.com/run', {})
  };
  const plugin = new WebhookPlugin(options, context, {});
  plugin.open(context, options);
  plugin.processMessage({
    type: 'browsertime.browser',
    data: { browser: { name: 'chrome', version: '150' } }
  });
  plugin.processMessage({
    type: 'browsertime.pageSummary',
    url: 'https://www.sitespeed.io/',
    data: {
      statistics: {
        googleWebVitals: { largestContentfulPaint: { median: 1200, max: 1400 } }
      }
    }
  });
  plugin.processMessage({
    type: 'budget.result',
    data: { working: {}, failing: {}, error: {} }
  });
  await plugin.close(options, ['Something failed']);
  server.close();

  const payload = server.bodies[0].body;
  t.is(payload.name, 'My test');
  t.is(payload.resultUrl, 'https://results.example.com/run/index.html');
  t.deepEqual(payload.browser, { name: 'chrome', version: '150' });
  t.is(payload.pages[0].url, 'https://www.sitespeed.io/');
  t.regex(
    payload.pages[0].resultUrl,
    /^https:\/\/results\.example\.com\/run\/.+index\.html$/
  );
  t.deepEqual(payload.pages[0].googleWebVitals, {
    largestContentfulPaint: 1200
  });
  t.deepEqual(payload.budget, { working: {}, failing: {}, error: {} });
  t.deepEqual(payload.errors, ['Something failed']);
});
