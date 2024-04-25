/* eslint-disable @typescript-eslint/no-var-requires */
import * as matchers from 'jest-extended'
expect.extend(matchers)

// jest.setTimeout(10000)
jest.setTimeout(600 * 60 * 1000)
process.env.DEBUG = 'false'
