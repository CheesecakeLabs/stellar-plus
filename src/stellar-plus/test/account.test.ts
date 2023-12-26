import Freighter from '@stellar/freighter-api'
import Stellar from '@stellar/stellar-sdk'
import axios from 'axios'

import { FreighterAccountHandlerClient } from 'stellar-plus/account/account-handler/freighter'

import { MockAccountResponse } from './mocks/account-response-mock'
import { MockSubmitTransaction } from './mocks/transaction-mock'
import { Constants } from '..'
import { Base, DefaultAccountHandler, FreighterAccountHandler } from '../account'

jest.mock('@stellar/stellar-sdk')
jest.mock('@stellar/freighter-api', () => {
  return {
    isConnected: jest.fn().mockResolvedValue(true),
    isAllowed: jest.fn().mockResolvedValue(true),
    setAllowed: jest.fn().mockResolvedValue(true),
    getNetworkDetails: jest.fn().mockResolvedValue({
      networkPassphrase: 'Test SDF Network ; September 2015',
    }),
    getPublicKey: jest.fn().mockResolvedValue('GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ'),
  }
})

describe('Test account handler', () => {
  beforeEach(() => {
    const userKey = 'GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ'
    const userSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    mockKeypair(userKey, userSecret)
    mockServer(userKey, issuerKey)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function mockKeypair(publicKey: string, secret: string): void {
    const mockedKeypair = {
      publicKey: jest.fn().mockReturnValue(publicKey),
      secret: jest.fn().mockReturnValue(secret),
    }
    Stellar.Keypair.fromSecret = jest.fn().mockReturnValue(mockedKeypair)
    Stellar.Keypair.random = jest.fn().mockReturnValue(mockedKeypair)
  }

  function mockServer(userKey: string, issuerKey: string): void {
    const mockAccountResponse = new MockAccountResponse(userKey, issuerKey)
    const mockLoadAccount = jest.fn().mockReturnValue(mockAccountResponse)
    const mockSubmitTransaction = jest.fn().mockResolvedValue(MockSubmitTransaction)
    const mockServer = jest.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
      submitTransaction: mockSubmitTransaction,
    }))
    Stellar.Server = mockServer
    Stellar.Horizon.Server = mockServer
  }

  test('create and initialize default account with random secret key', async function () {
    const network = Constants.testnet
    const account = new DefaultAccountHandler({ network })

    axios.get = jest.fn().mockResolvedValue({ data: 'Success' })
    await account.friendbot?.initialize()

    expect(account.getPublicKey()).toHaveLength(56)
    expect(axios.get).toHaveBeenCalledWith(`${Constants.testnet.friendbotUrl}?addr=${account.getPublicKey()}`)
  })

  test('create and initialize base account', async function () {
    const publicKey = 'CCZUQBT62C3E7NRKQKMVKMS6SY5UNLGJINOLRGXMOU35WXC6RRBSMZGM'
    const account = new Base({ publicKey })

    expect(account.getPublicKey()).toBe(publicKey)
  })

  test('create and sing base account handler', async function () {
    const userSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const account = new DefaultAccountHandler({ network: Constants.testnet, secretKey: userSecret })
    const mockTransaction: any = {
      sign: jest.fn().mockReturnValue('sign'),
      toXDR: jest.fn().mockReturnValue('toXDR'),
    }
    const result = account.sign(mockTransaction)

    expect(result).toBe('toXDR')
    expect(mockTransaction.sign).toHaveBeenCalled()
  })

  test('create and connect freighter account', async function () {
    const network = Constants.testnet
    const account = new FreighterAccountHandlerClient({ network })
    const loadPublicKey = jest.spyOn(account, 'loadPublicKey')
    const isFreighterInstalled = jest.spyOn(account, 'isFreighterInstalled')
    const isFreighterConnected = jest.spyOn(account, 'isFreighterConnected')

    await account.connect()
    const publicKey = account.getPublicKey()

    expect(loadPublicKey).toHaveBeenCalledTimes(1)
    expect(isFreighterInstalled).toHaveBeenCalledTimes(1)
    expect(isFreighterConnected).toHaveBeenCalledTimes(1)
    expect(account.getPublicKey()).toBe(publicKey)
  })

  test('create, connect and disconnect freighter account', async function () {
    const network = Constants.testnet
    const account = new FreighterAccountHandler({ network })
    const loadPublicKey = jest.spyOn(account, 'loadPublicKey')
    const isFreighterInstalled = jest.spyOn(account, 'isFreighterInstalled')
    const isFreighterConnected = jest.spyOn(account, 'isFreighterConnected')

    await account.connect()
    account.disconnect()

    expect(loadPublicKey).toHaveBeenCalledTimes(1)
    expect(isFreighterInstalled).toHaveBeenCalledTimes(1)
    expect(isFreighterConnected).toHaveBeenCalledTimes(1)
    expect(account.getPublicKey()).toBe('')
  })

  test('create and freighter not installed', async function () {
    const network = Constants.testnet
    const account = new FreighterAccountHandler({ network })
    const loadPublicKey = jest.spyOn(account, 'loadPublicKey')
    const isFreighterInstalled = jest.spyOn(account, 'isFreighterInstalled').mockResolvedValue(false)
    const isFreighterConnected = jest.spyOn(account, 'isFreighterConnected')

    await account.connect()
    const connected = await account.isFreighterConnected()

    expect(loadPublicKey).toHaveBeenCalledTimes(1)
    expect(isFreighterInstalled).toHaveBeenCalledTimes(2)
    expect(isFreighterConnected).toHaveBeenCalledTimes(2)
    expect(account.getPublicKey()).toBe('')
    expect(connected).toBe(false)
  })

  test('Network is not correct', async function () {
    const network = Constants.testnet
    const account = new FreighterAccountHandler({ network })
    const isFreighterInstalled = jest.spyOn(account, 'isFreighterInstalled')
    const isApplicationAuthorized = jest.spyOn(account, 'isApplicationAuthorized')

    jest
      .spyOn(Freighter, 'getNetworkDetails')
      .mockResolvedValue({ networkPassphrase: 'Error network', network: 'network', networkUrl: 'url' })
    const isConnected = await account.isFreighterConnected()

    expect(isConnected).toBeFalsy()
    expect(isFreighterInstalled).toHaveBeenCalledTimes(1)
    expect(isApplicationAuthorized).toHaveBeenCalledTimes(1)
  })

  test('Application is not allowed', async function () {
    const account = new FreighterAccountHandler({ network: Constants.testnet })
    jest.spyOn(Freighter, 'isAllowed').mockResolvedValue(false)

    const isConnected = await account.isApplicationAuthorized()

    expect(isConnected).toBeFalsy()
  })

  test('Enforce connection', async function () {
    const network = Constants.testnet
    const account = new FreighterAccountHandler({ network })
    const isFreighterInstalled = jest.spyOn(account, 'isFreighterInstalled')
    const isApplicationAuthorized = jest.spyOn(account, 'isApplicationAuthorized').mockResolvedValueOnce(false)

    const enforceConnection = true
    const freighterCallback = jest.fn()
    const isConnected = await account.isFreighterConnected(enforceConnection, freighterCallback)

    expect(isConnected).toBeFalsy()
    expect(isFreighterInstalled).toHaveBeenCalledTimes(2)
    expect(isApplicationAuthorized).toHaveBeenCalledTimes(1)
  })
})
