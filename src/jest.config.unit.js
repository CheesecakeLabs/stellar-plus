// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['cobertura', 'json', 'html', 'text'],
  collectCoverageFrom: [
    './**/*.ts',
    '!<rootDir>/*/.*\\.types.ts',
    '!<rootDir>/*/.*\\.mocks.ts',
    '!<rootDir>/dist/',
    '!/node_modules/',
    '!/coverage/',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/index-test.ts'],
  setupFilesAfterEnv: ['./setup-tests.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleDirectories: ['node_modules', 'src'],
  rootDir: './',
  testTimeout: 30 * 1000,
}
