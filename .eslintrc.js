var path = require('path');

module.exports = {
  extends: [
    require.resolve('ember-cli-eslint/coding-standard/ember-application.js')
  ],
  env: {
    node: true,
    browser: true,
    es6: true
  },
  globals: {
    requireNode: true,
    uuid: true
  },
  rules: {
    'no-console': 0,
    'no-multi-spaces': 2,
    'one-var': ['error', 'never'],
    'indent': ['error', 2]
  },
};
