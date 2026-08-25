/**
 * Master Test Runner for Aura Music 2.0
 * Forwards execution to the root standalone test harness `test_e2e_suite.js`.
 */

const path = require('path');

const harnessPath = path.resolve(__dirname, '..', 'test_e2e_suite.js');
require(harnessPath);
