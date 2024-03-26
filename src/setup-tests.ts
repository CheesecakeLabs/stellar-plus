/* eslint-disable @typescript-eslint/no-var-requires */
import * as matchers from 'jest-extended'
expect.extend(matchers)

jest.setTimeout(10000)
process.env.DEBUG = 'false'
