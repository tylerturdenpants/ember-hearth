module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    'browser': true,
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
  overrides: [
	  // node files
	  {
		  files: [
			  'testem.js',
			  'ember-cli-build.js',
			  'config/**/*.js'
		  ],
		  parserOptions: {
			  sourceType: 'script',
			  ecmaVersion: 2015
		  },
		  env: {
			  browser: false,
			  node: true
		  }
	  }
  ]
};
