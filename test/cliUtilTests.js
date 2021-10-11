'use strict';

const cliUtil = require('../lib/cli/util'),
  expect = require('chai').expect;

describe('cliUtil', function () {
  describe('getURLs', function () {
    it('should extract urls', function () {
      let urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls.txt']);
      expect(urls[0] === 'https://www.sitespeed.io');
      expect(urls[3] === 'https://www.sitespeed.io/documentation/faq');

      urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls-aliases.txt']);
      expect(urls[0] === 'https://www.sitespeed.io');
      expect(urls[3] === 'https://www.sitespeed.io/documentation/faq');
    });
  });

  describe('getAliases', function () {
    it('should extract aliases', function () {
      let aliases = cliUtil.getAliases(['test/fixtures/sitespeed-urls.txt']);
      expect(aliases['https://www.sitespeed.io']).to.be.undefined;
      expect(
        aliases[
          'https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'
        ]
      ).to.be.undefined;

      aliases = cliUtil.getAliases([
        'test/fixtures/sitespeed-urls-aliases.txt'
      ]);
      expect(aliases['https://www.sitespeed.io'].urlAlias).to.equal(
        'Home_Page'
      );
      expect(
        aliases[
          'https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'
        ]
      ).to.be.undefined;
    });
  });

  describe('pluginDefaults', () => {
    it('should yield an empty object for invalid values', () => {
      expect(cliUtil.pluginDefaults()).to.eql({});
      expect(cliUtil.pluginDefaults(null)).to.eql({});
      expect(cliUtil.pluginDefaults(1)).to.eql({});
      expect(cliUtil.pluginDefaults(true)).to.eql({});
      expect(cliUtil.pluginDefaults(false)).to.eql({});
      expect(cliUtil.pluginDefaults('trust me!')).to.eql({});
    });

    it('should yield a map of defaults based on config names and its defaults', () => {
      const cliOptions = {
        propName: {
          default: 'value'
        }
      };
      expect(cliUtil.pluginDefaults(cliOptions).propName).to.eql('value');
    });

    it('should not include options without an explicit default set', () => {
      const cliOptions = {
        propName: {
          default: 'value'
        },

        otherProp: {
          description: 'No default set'
        }
      };

      expect(cliUtil.pluginDefaults(cliOptions).otherProp).to.be.undefined;
    });
  });

  describe('registerPluginOptions', () => {
    const mockYargs = () => ({
      calls: [],
      option() {
        this.calls.push(Array.from(arguments));
      }
    });

    it('should not setup options with invalid values', () => {
      const plugin = {
        name() {
          return 'test';
        }
      };

      const codeUnderTest = () =>
        cliUtil.registerPluginOptions(mockYargs(), plugin);

      // Undefined cliOptions
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: undefined`
      );

      plugin.cliOptions = null;
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: null`
      );

      plugin.cliOptions = true;
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: true`
      );

      plugin.cliOptions = false;
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: false`
      );

      plugin.cliOptions = 1;
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: 1`
      );

      plugin.cliOptions =
        'trust me! I am a valid options definition :puss_in_boots_eyes:';
      expect(codeUnderTest).to.throw(
        `Invalid CLI options defined for plugin: trust me! I am a valid options definition :puss_in_boots_eyes:`
      );
    });

    it('must have an explicit name defined in the plugin', () => {
      function codeUnderTest() {
        cliUtil.registerPluginOptions(mockYargs(), {
          processMessage() {
            // Apparently a safe plugin definition
            return undefined;
          }
        });
      }

      expect(codeUnderTest).to.throw(
        `Missing name() method for plugin registering CLI options`
      );
    });

    it('should call yargs.options() when cliOptions is defined as method', () => {
      const fakeYargs = mockYargs();
      const plugin = {
        name() {
          return 'test';
        },
        cliOptions() {
          return {
            prop1: {
              default: 80
            },

            'nested.config': {
              description: 'Any help text'
            }
          };
        }
      };
      cliUtil.registerPluginOptions(fakeYargs, plugin);

      expect(fakeYargs.calls).to.be.an('array').with.lengthOf(2);

      const expectedProp1 = ['test.prop1', { default: 80 }];
      expect(fakeYargs.calls.find(call => call[0] === 'test.prop1')).to.eql(
        expectedProp1
      );

      const expectedNested = [
        'test.nested.config',
        { description: 'Any help text' }
      ];
      expect(
        fakeYargs.calls.find(call => call[0] === 'test.nested.config')
      ).to.eql(expectedNested);
    });

    it('should call yargs.options() when cliOptions is defined as computed property', () => {
      const fakeYargs = mockYargs();
      const plugin = {
        name() {
          return 'test';
        },
        get cliOptions() {
          return {
            prop1: {
              default: 80
            },

            'nested.config': {
              description: 'Any help text'
            }
          };
        }
      };
      cliUtil.registerPluginOptions(fakeYargs, plugin);

      expect(fakeYargs.calls).to.be.an('array').with.lengthOf(2);

      const expectedProp1 = ['test.prop1', { default: 80 }];
      expect(fakeYargs.calls.find(call => call[0] === 'test.prop1')).to.eql(
        expectedProp1
      );

      const expectedNested = [
        'test.nested.config',
        { description: 'Any help text' }
      ];
      expect(
        fakeYargs.calls.find(call => call[0] === 'test.nested.config')
      ).to.eql(expectedNested);
    });

    it('should call yargs.options() when cliOptions is defined as regular property', () => {
      const fakeYargs = mockYargs();
      const plugin = {
        name() {
          return 'test';
        },
        cliOptions: {
          prop1: {
            default: 80
          },

          'nested.config': {
            description: 'Any help text'
          }
        }
      };
      cliUtil.registerPluginOptions(fakeYargs, plugin);

      expect(fakeYargs.calls).to.be.an('array').with.lengthOf(2);

      const expectedProp1 = ['test.prop1', { default: 80 }];
      expect(fakeYargs.calls.find(call => call[0] === 'test.prop1')).to.eql(
        expectedProp1
      );

      const expectedNested = [
        'test.nested.config',
        { description: 'Any help text' }
      ];
      expect(
        fakeYargs.calls.find(call => call[0] === 'test.nested.config')
      ).to.eql(expectedNested);
    });
  });
});
