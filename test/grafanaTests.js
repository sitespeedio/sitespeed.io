const test = require('ava');

function plugin() {
  return require('../lib/plugins/grafana');
}

test(`Grafana plugin should have a .config property with default host port value`, t => {
  t.is(plugin().config.port, 80);
});

test(`Grafana plugin should include missing annotationScreenshot default value`, t => {
  t.is(plugin().config.annotationScreenshot, false);
});
