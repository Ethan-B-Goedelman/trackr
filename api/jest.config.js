module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  globalSetup: undefined,
  globalTeardown: undefined,
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterFramework: ['./tests/setup.js'],
};
