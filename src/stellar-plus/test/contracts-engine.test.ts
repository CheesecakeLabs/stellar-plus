import Stellar, { ContractSpec } from '@stellar/stellar-sdk'
import { Constants, ContractEngine, Contracts, RPC } from '..'
import { DefaultAccountHandler } from '../account'
import { MockAccountResponse } from './mocks/account-response-mock'
import { MockSubmitTransaction, mockTransactionBuilder, mockTransactionSubmitter } from './mocks/transaction-mock'

jest.mock('@stellar/stellar-sdk')

describe('Test contracts engine class', () => {
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
      getTransaction: jest.fn().mockResolvedValue('Success'),
      prepareTransaction: jest.fn().mockResolvedValue('Success'),
      simulateTransaction: jest.fn().mockResolvedValue('Success'),
    }))
    Stellar.Server = mockServer
    Stellar.TransactionBuilder = mockTransactionBuilder
    Stellar.Horizon.Server = mockServer
    Stellar.SorobanRpc.Server = mockServer
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
    Stellar.Address = jest.fn().mockReturnValue('address')
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('upload Wasm of contract', async () => {

    const specEntries = <any>["entries"]
    const contractSpec = new ContractSpec(specEntries);

    const contractArgs = {
      network: Constants.testnet,
      spec: contractSpec,
      contractId: "contractId"
    }

    const contract = new ContractEngine(contractArgs)
    const requireWasm = jest.spyOn(contract as any, 'requireWasm').mockResolvedValue(true)
    const uploadContractWasm = jest.spyOn(contract as any, 'uploadContractWasm').mockResolvedValue("Success")

    await contract.uploadWasm(<any>'txInvocation')
    expect(requireWasm).toHaveBeenCalled()
    expect(uploadContractWasm).toHaveBeenCalled()
  })

  test('Deploy contract', async () => {

    const specEntries = <any>["entries"]
    const contractSpec = new ContractSpec(specEntries);

    const contractArgs = {
      network: Constants.testnet,
      spec: contractSpec,
      contractId: "contractId",
      wasm: new Buffer("wasm")
    }

    const contract = new ContractEngine(contractArgs)
    jest.spyOn(contract as any, 'requireWasm').mockResolvedValue(true)
    jest.spyOn(contract as any, 'uploadContractWasm').mockResolvedValue("Success")
    await contract.uploadWasm(<any>'txInvocation')

    const deployContract = jest.spyOn(contract as any, 'deployContract').mockResolvedValue("contractId")
    await contract.deploy(<any>'txInvocation')

    expect(deployContract).toHaveBeenCalled()
  })

})
