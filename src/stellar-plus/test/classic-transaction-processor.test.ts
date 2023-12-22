import Stellar from '@stellar/stellar-sdk'
import { Constants } from '..'
import { MockAccountResponse } from './mocks/account-response-mock'
import { MockSubmitTransaction, mockTransactionInvocation, mockTransactionSubmitter } from './mocks/transaction-mock'
import { TransactionProcessor } from '../core/classic-transaction-processor'

jest.mock('@stellar/stellar-sdk')

describe('Test classic transaction processor', () => {
  beforeEach(() => {
    initMockStellar()
  })

  function mockKeypair(publicKey: any, secret: any) {
    const mockKeypair = {
      publicKey: jest.fn().mockReturnValue(publicKey),
      secret: jest.fn().mockReturnValue(secret),
    }
    Stellar.Keypair.fromSecret = jest.fn().mockReturnValue(mockKeypair)
  }

  function mockServer(userKey: string, issuerKey: string) {
    const mockAccountResponse = new MockAccountResponse(userKey, issuerKey)
    const mockLoadAccount = jest.fn().mockReturnValue(mockAccountResponse)
    const mockSubmitTransaction = jest.fn().mockResolvedValue(MockSubmitTransaction)
    const mockServer = jest.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
      submitTransaction: mockSubmitTransaction,
      server: {
        submitTransaction: mockSubmitTransaction,
      },
    }))
    Stellar.Server = mockServer
    Stellar.Horizon.Server = mockServer
  }

  function mockAsset(issuerKey: string) {
    Stellar.Asset = jest.fn().mockImplementation(() => ({
      getIssuer: jest.fn().mockReturnValue(issuerKey),
    }))
  }

  function initMockStellar() {
    const userKey = 'GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ'
    const userSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    mockKeypair(userKey, userSecret)
    mockServer(userKey, issuerKey)
    mockAsset(issuerKey)
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Build custom transaction', async () => {
    const network = Constants.testnet
    const transactionProcessor = new TransactionProcessor({ network: network, transactionSubmitter: mockTransactionSubmitter() })

    const transaction = await transactionProcessor.buildCustomTransaction(<any>'operations', <any>'txInvocation')
    expect(String(transaction)).toBe(String({ builtTx: true, updatedTxInvocation: mockTransactionInvocation() }))
  })

  test('Process transaction', async () => {
    const network = Constants.testnet
    const transactionProcessor = new TransactionProcessor({ network: network, transactionSubmitter: mockTransactionSubmitter() })
    const processTransaction = jest
      .spyOn(transactionProcessor as any, 'signEnvelope')
      .mockResolvedValue('signedEnvelope')
    const transaction = await transactionProcessor.processTransaction(<any>'Transaction', <any>'signers')
    const transactionExpected = MockSubmitTransaction
    expect(transaction).toStrictEqual(transactionExpected)
    expect(processTransaction).toHaveBeenCalledTimes(1)
  })
})
