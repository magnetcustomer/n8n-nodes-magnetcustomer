// jest.e2e.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e/tests'],
  testMatch: ['**/*.e2e.test.ts'],
  globalSetup: '<rootDir>/e2e/helpers/globalSetup.ts',
  globalTeardown: '<rootDir>/e2e/helpers/globalTeardown.ts',
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
};
