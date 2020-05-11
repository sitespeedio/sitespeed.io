const expect = require('chai').expect;

describe('grafana', () => {
  function plugin() {
    return require('../lib/plugins/grafana');
  }

  describe('plugin', () => {
    it('should have a .config property with default host port value', () => {
      // Regression: ensure the original interface is not broken
      expect(plugin().config).to.have.property('port', 80);
    });

    it('should include missing annotationScreenshot default value', () => {
      // Regression. All defaults should be exposed
      expect(plugin().config).to.have.property('annotationScreenshot', false);
    });
  });
});
