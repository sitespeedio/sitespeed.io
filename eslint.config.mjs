import prettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ignores: [
      'docs/*',
      'docker/*',
      'assets/*',
      'sitespeed-result/*',
      'lib/plugins/yslow/scripts/*',
      'lib/plugins/html/assets/js/*',
      'bin/browsertimeWebPageReplay.js',
      'test/data/*',
      'test/prepostscripts/*'
    ]
  },
  js.configs.recommended,
  unicorn.configs.recommended,
  {
    plugins: {
      prettier
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none',
          arrowParens: 'avoid',
          embeddedLanguageFormatting: 'off'
        }
      ],

      'require-atomic-updates': 0,
      'no-extra-semi': 0,
      'no-mixed-spaces-and-tabs': 0,
      'unicorn/filename-case': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/prefer-spread': 0
    }
  }
];
