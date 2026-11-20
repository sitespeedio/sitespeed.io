import test from 'ava';

import {
  AnnotationQueue,
  getAnnotationMessage
} from '../lib/support/annotationsHelper.js';

const options = {
  browsertime: { iterations: 3 },
  graphite: {},
  grafana: { annotationMessage: 'Pipeline 42' }
};

test('Annotation message links to the result when there is a base URL', t => {
  const message = getAnnotationMessage(
    'https://results.com/pages/www_sitespeed_io/',
    false,
    'png',
    undefined,
    true,
    options
  );
  t.is(
    message,
    "<a href='https://results.com/pages/www_sitespeed_io/index.html' target='_blank'>Result 3 runs</a> - Pipeline 42"
  );
});

test('Annotation message has no links without a base URL', t => {
  const message = getAnnotationMessage(
    undefined,
    true,
    'png',
    undefined,
    true,
    options
  );
  t.is(message, '3 runs - Pipeline 42');
});

test('Annotations are sent at once when nothing is uploaded', async t => {
  const annotations = new AnnotationQueue();
  let sent = 0;
  annotations.onMessage({ type: 'browsertime.setup' });
  await annotations.send(() => Promise.resolve(sent++));
  t.is(sent, 1);
});

test('Annotations wait until the result is uploaded', async t => {
  const annotations = new AnnotationQueue();
  let sent = 0;
  annotations.onMessage({ type: 'scp.setup' });
  annotations.send(() => Promise.resolve(sent++));
  annotations.send(() => Promise.resolve(sent++));
  t.is(sent, 0);
  await annotations.onMessage({ type: 'scp.finished' });
  t.is(sent, 2);
});

test('Annotations wait for all uploads', async t => {
  const annotations = new AnnotationQueue();
  let sent = 0;
  annotations.onMessage({ type: 's3.setup' });
  annotations.onMessage({ type: 'rsync.setup' });
  annotations.send(() => Promise.resolve(sent++));
  t.is(annotations.onMessage({ type: 's3.finished' }), undefined);
  t.is(sent, 0);
  await annotations.onMessage({ type: 'rsync.finished' });
  t.is(sent, 1);
});

test('Waiting annotations are sent when the run ends without an upload', async t => {
  const annotations = new AnnotationQueue();
  let sent = 0;
  annotations.onMessage({ type: 'gcs.setup' });
  annotations.send(() => Promise.resolve(sent++));
  await annotations.flush();
  t.is(sent, 1);
  await annotations.flush();
  t.is(sent, 1);
});
