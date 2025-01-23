// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage/all',
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
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!ethereum-cryptography)'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  logHeapUsage: true,
  maxWorkers: 1,
  maxConcurrency: 1,
  testTimeout: 30 * 60 * 1000, // 30 minutes
  runInBand: true,
}
