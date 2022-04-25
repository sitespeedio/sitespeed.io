'use strict';

const cliUtil = require('../lib/cli/util');
const test = require('ava');

test(`getURLs should extract urls`, t => {
  let urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls.txt']);
  t.is(urls[0], 'https://www.sitespeed.io');
  t.is(urls[3], 'https://www.sitespeed.io/faq');

  urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls-aliases.txt']);
  t.is(urls[0], 'https://www.sitespeed.io');
  t.is(urls[3], 'https://www.sitespeed.io/faq');
});

test(`getAliases should extract aliases`, t => {
  let aliases = cliUtil.getAliases(['test/fixtures/sitespeed-urls.txt']);
  t.is(aliases['https://www.sitespeed.io'], undefined);
  t.is(
    aliases['https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'],
    undefined
  );

  aliases = cliUtil.getAliases(['test/fixtures/sitespeed-urls-aliases.txt']);

  t.is(aliases['https://www.sitespeed.io'].urlAlias, 'Home_Page');
  t.is(
    aliases['https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'],
    undefined
  );
});

test(`pluginDefaults should yield an empty object for invalid values`, t => {
  t.deepEqual(cliUtil.pluginDefaults(), {});
  t.deepEqual(cliUtil.pluginDefaults(null), {});
  t.deepEqual(cliUtil.pluginDefaults(1), {});
  t.deepEqual(cliUtil.pluginDefaults(true), {});
});

test(`pluginDefaults should yield a map of defaults based on config names and its defaults`, t => {
  const cliOptions = {
    propName: {
      default: 'value'
    }
  };

  t.is(cliUtil.pluginDefaults(cliOptions).propName, 'value');
});

test(`pluginDefaults should not include options without an explicit default set`, t => {
  const cliOptions = {
    propName: {
      default: 'value'
    },

    otherProp: {
      description: 'No default set'
    }
  };

  t.is(cliUtil.pluginDefaults(cliOptions).otherProp, undefined);
});

test(`registerPluginOptions  should not setup options with invalid values`, t => {
  const mockYargs = () => ({
    calls: [],
    option() {
      this.calls.push(Array.from(arguments));
    }
  });

  const plugin = {
    name() {
      return 'test';
    }
  };

  const codeUnderTest = () =>
    cliUtil.registerPluginOptions(mockYargs(), plugin);

  t.throws(codeUnderTest);

  plugin.cliOptions = null;
  t.throws(codeUnderTest);

  plugin.cliOptions = true;
  t.throws(codeUnderTest);
});

test(`registerPluginOptions must have an explicit name defined in the plugin`, t => {
  const mockYargs = () => ({
    calls: [],
    option() {
      this.calls.push(Array.from(arguments));
    }
  });

  function codeUnderTest() {
    cliUtil.registerPluginOptions(mockYargs(), {
      processMessage() {
        // Apparently a safe plugin definition
        return undefined;
      }
    });
  }

  t.throws(codeUnderTest);
});

test(`registerPluginOptions should call yargs.options() when cliOptions is defined as method`, t => {
  const mockYargs = () => ({
    calls: [],
    option() {
      this.calls.push(Array.from(arguments));
    }
  });

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
  const expectedProp1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProp1
  );

  const expectedNested = [
    'test.nested.config',
    { description: 'Any help text' }
  ];
  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.nested.config'),
    expectedNested
  );
});

test(`registerPluginOptions should call yargs.options() when cliOptions is defined as computed property`, t => {
  const mockYargs = () => ({
    calls: [],
    option() {
      this.calls.push(Array.from(arguments));
    }
  });
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

  const expectedProp1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProp1
  );

  const expectedNested = [
    'test.nested.config',
    { description: 'Any help text' }
  ];
  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.nested.config'),
    expectedNested
  );
});

test(`registerPluginOptions should call yargs.options() when cliOptions is defined as regular property`, t => {
  const mockYargs = () => ({
    calls: [],
    option() {
      this.calls.push(Array.from(arguments));
    }
  });
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

  const expectedProp1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProp1
  );

  const expectedNested = [
    'test.nested.config',
    { description: 'Any help text' }
  ];
  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.nested.config'),
    expectedNested
  );
});
