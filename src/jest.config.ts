import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  automock: false,
  moduleDirectories: ['node_modules', 'src']
}
export default config
