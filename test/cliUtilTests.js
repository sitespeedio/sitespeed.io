import {
  getURLs,
  getAliases,
  pluginDefaults,
  registerPluginOptions
} from '../lib/cli/util.js';
import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { messageMaker } from '../lib/support/messageMaker.js';

import test from 'ava';

const mockYargs = () => ({
  calls: [],
  option() {
    this.calls.push([...arguments]);
  }
});

test(`getURLs should extract urls`, t => {
  let urls = getURLs(['test/fixtures/sitespeed-urls.txt']);
  t.is(urls[0], 'https://www.sitespeed.io');
  t.is(urls[3], 'https://www.sitespeed.io/faq');

  urls = getURLs(['test/fixtures/sitespeed-urls-aliases.txt']);
  t.is(urls[0], 'https://www.sitespeed.io');
  t.is(urls[3], 'https://www.sitespeed.io/faq');
});

test(`getAliases should extract aliases`, t => {
  let aliases = getAliases(['test/fixtures/sitespeed-urls.txt']);
  t.is(aliases['https://www.sitespeed.io'], undefined);
  t.is(
    aliases['https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'],
    undefined
  );

  aliases = getAliases(['test/fixtures/sitespeed-urls-aliases.txt']);

  t.is(aliases['https://www.sitespeed.io'].urlAlias, 'Home_Page');
  t.is(
    aliases['https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'],
    undefined
  );
});

test(`pluginDefaults should yield an empty object for invalid values`, t => {
  t.deepEqual(pluginDefaults(), {});
  t.deepEqual(pluginDefaults(), {});
  t.deepEqual(pluginDefaults(1), {});
  t.deepEqual(pluginDefaults(true), {});
});

test(`pluginDefaults should yield a map of defaults based on config names and its defaults`, t => {
  const cliOptions = {
    propName: {
      default: 'value'
    }
  };

  t.is(pluginDefaults(cliOptions).propName, 'value');
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

  t.is(pluginDefaults(cliOptions).otherProp, undefined);
});

test(`registerPluginOptions  should not setup options with invalid values`, t => {
  class TestPlugin extends SitespeedioPlugin {
    constructor(options, context, queue) {
      super({ name: 'test', options, context, queue });
    }
  }
  const plugin = new TestPlugin({}, { messageMaker, intel });

  const codeUnderTest = () => registerPluginOptions(mockYargs(), plugin);

  t.throws(codeUnderTest);

  plugin.cliOptions = undefined;
  t.throws(codeUnderTest);

  plugin.cliOptions = true;
  t.throws(codeUnderTest);
});

function codeUnderTest() {
  registerPluginOptions(mockYargs(), {
    processMessage() {
      // Apparently a safe plugin definition
      return;
    }
  });
}

test(`registerPluginOptions must have an explicit name defined in the plugin`, t => {
  t.throws(codeUnderTest);
});

/*
test(`registerPluginOptions should call yargs.options() when cliOptions is defined as method`, t => {
  const fakeYargs = mockYargs();

  class TestPlugin extends Plugin {
    constructor(options, context, queue) {
      super({ name: 'test', options, context, queue });
    }
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
  }
  const plugin = new TestPlugin();
  registerPluginOptions(fakeYargs, plugin);
  const expectedProperty1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProperty1
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
  const fakeYargs = mockYargs();

  const plugin = {
    getName() {
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

  registerPluginOptions(fakeYargs, plugin);

  const expectedProperty1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProperty1
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
  const fakeYargs = mockYargs();
  const plugin = {
    getName() {
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

  registerPluginOptions(fakeYargs, plugin);

  const expectedProperty1 = ['test.prop1', { default: 80 }];

  t.deepEqual(
    fakeYargs.calls.find(call => call[0] === 'test.prop1'),
    expectedProperty1
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
*/
