// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'json', 'html', 'text'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/*/.*\\.types.ts', '.*\\mocks.ts', './coverage/'],
  collectCoverageFrom: ['./**/*.ts'],
  setupFilesAfterEnv: ['./setup-tests.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleDirectories: ['node_modules', 'src'],
  rootDir: './',
}
