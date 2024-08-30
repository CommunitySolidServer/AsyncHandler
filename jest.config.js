module.exports = {
  transform: {
    '^.+\\.ts$': [ 'ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Only run tests in the unit and integration folders.
  // All test files need to have the suffix `.test.ts`.
  testRegex: '/test/(unit|integration)/.*\\.test\\.ts$',
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: [ 'text', 'lcov' ],
  coveragePathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
    '/test/',
  ],
  coverageThreshold: {
    './src': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testTimeout: 90000,
};
