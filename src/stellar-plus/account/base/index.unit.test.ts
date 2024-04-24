/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios, { AxiosError } from 'axios'

import { TestNet } from 'stellar-plus/network'
import { AccountBase } from 'stellar-plus/account/base'
import { ABError } from 'stellar-plus/account/base/errors'
import { testnet } from 'stellar-plus/constants'
import { AxiosErrorTypes } from 'stellar-plus/error/helpers/axios'
import { HorizonHandler } from 'stellar-plus/horizon/types'

jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    get: jest.fn(),
  }
})

const MOCKED_AXIOS_GET = axios.get as jest.Mock

const TESTNET_CONFIG = TestNet()

const MOCKED_PK = 'GAUFIAL2LV2OV7EA4NTXZDVPQASGI5Y3EXZV2HQS3UUWMZ7UWJDQURYS'

describe('Base Account Handler', () => {

  describe('Initialization', () => {
    it('should initialize the base account handler with a public key', () => {
      const account = new AccountBase({ publicKey: MOCKED_PK })
      const spyPublicKey = jest.mocked((account as any).publicKey)

      expect(account).toBeDefined()
      expect(account).toBeInstanceOf(AccountBase)
      expect(spyPublicKey).toBe(MOCKED_PK)
    })

    it('should initialize with optional parameters', () => {
      const mockedHorizonHandler = jest.fn() as unknown as HorizonHandler
      const account = new AccountBase({
        publicKey: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
        horizonHandler: mockedHorizonHandler,
      })
      const spyNetworkConfig = jest.mocked((account as any).networkConfig)
      const spyHorizonHandler = jest.mocked((account as any).horizonHandler)

      expect(account).toBeDefined()
      expect(account).toBeInstanceOf(AccountBase)
      expect(spyNetworkConfig).toBe(TESTNET_CONFIG)
      expect(spyHorizonHandler).toBe(mockedHorizonHandler)
    })
  })

  describe('Core Functionalities', () => {
    let account: AccountBase
    const mockedLoadAccount = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      account = new AccountBase({
        publicKey: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
        horizonHandler: jest.mocked({
          loadAccount: mockedLoadAccount,
        } as unknown as HorizonHandler),
      })
    })

    it('should return the public key of the account', () => {
      expect(account.getPublicKey()).toBe(MOCKED_PK)
    })

    it('should initialize the account with the friendbot', async () => {
      MOCKED_AXIOS_GET.mockResolvedValue({ data: 'Success' })

      await account.initializeWithFriendbot()

      expect(MOCKED_AXIOS_GET).toHaveBeenCalledExactlyOnceWith(
        `${TESTNET_CONFIG.friendbotUrl}?addr=${encodeURIComponent(MOCKED_PK)}`
      )
    })

    it('should load the account balances', async () => {
      const mockedBalances = [
        {
          asset_type: 'native',
          balance: '10.0000000',
        },
      ]
      mockedLoadAccount.mockResolvedValue({ balances: mockedBalances })

      const balances = await account.getBalances()

      expect(balances).toBe(mockedBalances)
      expect(mockedLoadAccount).toHaveBeenCalledExactlyOnceWith(MOCKED_PK)
    })
  })

  describe('Error Handling', () => {
    let account: AccountBase
    const mockedLoadAccount = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      account = new AccountBase({
        publicKey: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
        horizonHandler: jest.mocked({
          loadAccount: mockedLoadAccount,
        } as unknown as HorizonHandler),
      })
    })

    it('should throw an error if friendbot fails to initialize the account', async () => {
      const mockedError = new Error('Failed to initialize with friendbot')
      MOCKED_AXIOS_GET.mockRejectedValue(mockedError)

      await expect(account.initializeWithFriendbot()).rejects.toThrow(
        ABError.failedToCreateAccountWithFriendbotError(mockedError)
      )
    })

    it('should throw an error if the request to friendbot fails', async () => {
      const mockedAxiosError = jest.mocked({
        message: 'Failed request',
        type: AxiosErrorTypes.AxiosRequestError,
        request: {},
      }) as unknown as AxiosError

      MOCKED_AXIOS_GET.mockRejectedValue(mockedAxiosError)

      await expect(account.initializeWithFriendbot()).rejects.toThrow(
        ABError.failedToCreateAccountWithFriendbotError(mockedAxiosError)
      )
    })

    it('should throw an error if the response from friendbot fails', async () => {
      const mockedAxiosError = jest.mocked({
        message: 'Failed response',
        type: AxiosErrorTypes.AxiosResponseError,
        response: {},
      }) as unknown as AxiosError

      MOCKED_AXIOS_GET.mockRejectedValue(mockedAxiosError)

      await expect(account.initializeWithFriendbot()).rejects.toThrow(
        ABError.failedToCreateAccountWithFriendbotError(mockedAxiosError)
      )
    })

    it('should throw an error if the account balances cannot be loaded', async () => {
      const mockedError = new Error('Failed to load account balances')
      mockedLoadAccount.mockRejectedValue(mockedError)

      await expect(account.getBalances()).rejects.toThrow(ABError.failedToLoadBalances(mockedError))
      expect(mockedLoadAccount).toHaveBeenCalledExactlyOnceWith(MOCKED_PK)
    })

    it('should throw an error if the friendbot is not available', async () => {
      account = new AccountBase({ publicKey: MOCKED_PK })

      await expect(account.initializeWithFriendbot()).rejects.toThrow(ABError.friendbotNotAvailableError())
    })

    it('should throw an error if the horizon handler is not available', async () => {
      account = new AccountBase({ publicKey: MOCKED_PK })

      await expect(account.getBalances()).rejects.toThrow(ABError.horizonHandlerNotAvailableError())
    })
  })
})
