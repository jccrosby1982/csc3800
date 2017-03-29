/**
 * Export lodash globally
 */
global._ = require('lodash');

/**
 * Export `expect` globally
 */
global.expect = require('chai').expect;

/**
 * Require the subject under test
 */
_.mixin(require('..'));

/**
 * Reset inflections befor each test
 */
beforeEach(function() {
  _.resetInflections();
});
