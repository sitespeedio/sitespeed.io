import test from 'ava';

import { getAnnotationMessage } from '../lib/support/annotationsHelper.js';

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
