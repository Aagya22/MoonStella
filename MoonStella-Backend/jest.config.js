/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // Runs before any module (so env.ts validation passes on import)
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  clearMocks: true,
  testTimeout: 30000,
  // The in-memory Mongo download can be slow on the very first run
  maxWorkers: 1,
}
