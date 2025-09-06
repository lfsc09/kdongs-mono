import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { apiClient } from '@japa/api-client';
import { expect } from '@japa/expect';
import { pluginAdonisJS } from '@japa/plugin-adonisjs';
import { github, spec } from '@japa/runner/reporters';
import type { Config } from '@japa/runner/types';

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [expect(), apiClient(), pluginAdonisJS(app)];

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
};

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start());
  }
};

/**
 * Configure reporters to use for the test
 */
const activated = ['spec'];
if (process.env.GITHUB_ACTIONS === 'true') {
  activated.push('github');
}
export const reporters: Config['reporters'] = {
  activated,
  list: [spec(), github()],
};
