import Stellar from '@stellar/stellar-sdk'

import { MockAccountResponse } from './mocks/account-response-mock'
import { MockSubmitTransaction, mockTransactionInvocation, mockTransactionSubmitter } from './mocks/transaction-mock'
import { Constants } from '..'
import { DefaultAccountHandler } from '../account'
import { ClassicAssetHandler } from '../asset'
import { AssetTypes } from '../asset/types'

jest.mock('@stellar/stellar-sdk')

describe('Test classic asset handler', () => {
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

  test('should return the balance of classic asset', async () => {
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    const issuerSecret = 'SANYKKTYB25CYEVLFOYNPO767X5222DKJP7D55HEVSTIGU2D4SCCNOI4'

    const mockIssuerAccount = new DefaultAccountHandler({
      network: Constants.testnet,
      secretKey: issuerSecret,
    })

    const classicAssetHandler = new ClassicAssetHandler({
      code: 'CAKE',
      issuerPublicKey: issuerKey,
      network: Constants.testnet,
      issuerAccount: mockIssuerAccount,
    })

    const assetBalance = await classicAssetHandler.balance(issuerKey)
    expect(assetBalance).toEqual(3000000)
  })

  test('add Trustline and mint classic asset', async () => {
    const userSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    const issuerSecret = 'SANYKKTYB25CYEVLFOYNPO767X5222DKJP7D55HEVSTIGU2D4SCCNOI4'

    const user = new DefaultAccountHandler({
      secretKey: userSecret,
      network: Constants.testnet,
    })

    mockKeypair(issuerKey, issuerSecret)
    const assetIssuer = new DefaultAccountHandler({
      secretKey: issuerSecret,
      network: Constants.testnet,
    })

    const txInvocationConfig = {
      header: {
        source: user.getPublicKey(),
        fee: '1000',
        timeout: 30,
      },
      signers: [],
    }

    const cakeToken = new ClassicAssetHandler({
      code: 'CAKE',
      issuerPublicKey: issuerKey,
      network: Constants.testnet,
      issuerAccount: assetIssuer,
      transactionSubmitter: mockTransactionSubmitter,
    })

    const processTransaction = jest.spyOn(cakeToken, 'processTransaction').mockResolvedValue(<any>true)

    await cakeToken.addTrustlineAndMint(user.getPublicKey(), 100, {
      ...txInvocationConfig,
      signers: [user],
    })

    const userBalance = await cakeToken.balance(user.publicKey)
    expect(processTransaction).toHaveBeenCalled()
    expect(userBalance).toEqual(3000000)
  })

  test('should do the transfer of classic asset', async () => {
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    const issuerSecret = 'SANYKKTYB25CYEVLFOYNPO767X5222DKJP7D55HEVSTIGU2D4SCCNOI4'
    const userOneSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const userTwoKey = 'GDIIZURIQTZYEEE6URMWG7WWQJDLATOBERNS3QFEERLIPJJQEXBSKGGI'
    const userTwoSecret = 'SDD4DJRVD7WC72UKTURX6FBOCRJIE2FBG3UC2ZLBLZOSP47QA5YIKU3Z'

    const userOne = new DefaultAccountHandler({
      secretKey: userOneSecret,
      network: Constants.testnet,
    })

    mockKeypair(userTwoKey, userTwoSecret)
    const userTwo = new DefaultAccountHandler({
      secretKey: userTwoSecret,
      network: Constants.testnet,
    })

    mockKeypair(issuerKey, issuerSecret)
    const assetIssuer = new DefaultAccountHandler({
      secretKey: issuerSecret,
      network: Constants.testnet,
    })

    const classicAssetHandler = new ClassicAssetHandler({
      code: 'CAKE',
      issuerPublicKey: issuerKey,
      network: Constants.testnet,
      issuerAccount: assetIssuer,
      transactionSubmitter: mockTransactionSubmitter,
    })
    const txInvocation = mockTransactionInvocation(userOne.publicKey)

    const processTransaction = jest.spyOn(classicAssetHandler, 'processTransaction').mockResolvedValue(<any>true)
    await classicAssetHandler.transfer(userOne.publicKey, userTwo.publicKey, BigInt(100000), txInvocation)
    expect(processTransaction).toHaveBeenCalled()
  })

  test('should mint classic asset', async () => {
    const userSecret = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'
    const issuerKey = 'GD3MJLWE54WOGKAT4SOSMDCPJA6ZTHZ4TW73XFIOCVIHFIDYWDUKAYZT'
    const issuerSecret = 'SANYKKTYB25CYEVLFOYNPO767X5222DKJP7D55HEVSTIGU2D4SCCNOI4'

    const user = new DefaultAccountHandler({
      secretKey: userSecret,
      network: Constants.testnet,
    })

    mockKeypair(issuerKey, issuerSecret)

    const assetIssuer = new DefaultAccountHandler({
      secretKey: issuerSecret,
      network: Constants.testnet,
    })

    const txInvocationConfig = {
      header: {
        source: user.getPublicKey(),
        fee: '1000',
        timeout: 30,
      },
      signers: [],
    }

    const cakeToken = new ClassicAssetHandler({
      code: 'CAKE',
      issuerPublicKey: issuerKey,
      network: Constants.testnet,
      issuerAccount: assetIssuer,
      transactionSubmitter: mockTransactionSubmitter,
    })

    const processTransaction = jest.spyOn(cakeToken, 'processTransaction').mockResolvedValue(<any>true)
    await cakeToken.mint(user.getPublicKey(), BigInt(100), txInvocationConfig)
    const userBalance = await cakeToken.balance(user.publicKey)

    expect(userBalance).toEqual(3000000)
    expect(processTransaction).toHaveBeenCalled()
  })

  test('should have the correct type, symbol and name for the asset', async () => {
    const mockIssuerAccount = new DefaultAccountHandler({
      network: Constants.testnet,
      secretKey: 'SC7QP27MA524VRVSBOWQ3TKWAWR27WADFMKPIT4IFSXSKAYCTCBNCECZ',
    })

    const classicAssetHandler = new ClassicAssetHandler({
      code: 'ABC',
      issuerPublicKey: 'GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ',
      network: Constants.testnet,
      issuerAccount: mockIssuerAccount,
    })

    const symbol = await classicAssetHandler.symbol()
    const name = await classicAssetHandler.name()

    expect(classicAssetHandler.type).toEqual(AssetTypes.credit_alphanum4)
    expect(symbol).toEqual('ABC')
    expect(name).toEqual('ABC')
  })
})
