export default {
  env: {
    browser: true,
    es2016: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: 'module',
  },
  rules: {},
  plugins: ['jest', '@typescript-eslint'],
  root: true,
};
