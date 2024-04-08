/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { CAHError } from 'stellar-plus/asset/classic/errors'
import { testnet } from 'stellar-plus/constants'
import {
  BuildTransactionPipelinePlugin,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import {
  ClassicTransactionPipelinePlugin,
  ClassicTransactionPipelineType,
} from 'stellar-plus/core/pipelines/classic-transaction/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon'
import { mockAccountHandler } from 'stellar-plus/test/mocks/transaction-mock'
import { TransactionInvocation } from 'stellar-plus/types'

jest.mock('@stellar/stellar-sdk', () => {
  // The mock doesnt spread the whole originalModule because some internal exported objects cause failures
  // so we just unmock the necessary items.
  // uncomment and use the following line if you need to check the contents of the module:
  // const originalModule: typeof import('@stellar/stellar-sdk') = jest.requireActual('@stellar/stellar-sdk')
  const originalModule = jest.requireActual('@stellar/stellar-sdk')
  return {
    xdr: originalModule.xdr,
    Asset: originalModule.Asset,
    TransactionBuilder: originalModule.TransactionBuilder,
    Operation: {
      payment: jest.fn().mockReturnValue('paymentOp'),
      changeTrust: jest.fn().mockReturnValue('changeTrustOp'),
    },
  }
})

jest.mock('stellar-plus/horizon', () => ({
  HorizonHandlerClient: jest.fn().mockImplementation(() => ({
    account: jest.fn(),
    loadAccount: jest.fn(),
  })),
}))

const MOCKED_HORIZON_HANDLER = HorizonHandlerClient as jest.Mock

const TESTNET_CONFIG = testnet
const MOCKED_PK = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_PK_B = 'GBCBCTQ6YH3XFYDDGARNGYSS2LGTX5CA6P3P2K6ODSRNBKKK7BWMEEVM'

describe('Classic Asset Handler', () => {
  describe('Initialization', () => {
    it('should be able to create a new instance with just the asset parameters', () => {
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset).toBeDefined()
      expect(asset).toBeInstanceOf(ClassicAssetHandler)
      expect(asset.code).toBe('CAKE')
      expect(asset.issuerPublicKey).toBe(MOCKED_PK)
    })

    it('should be able to create a new instance with the issuer account handler', () => {
      const mockedIssuerAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: mockedIssuerAccountHandler,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset).toBeDefined()
      expect(asset).toBeInstanceOf(ClassicAssetHandler)
      expect(asset.code).toBe('CAKE')
      expect(asset.issuerPublicKey).toBe(MOCKED_PK)
    })

    it('should initialize the type as credit_alphanum4 based on the code length', () => {
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.type).toBe('credit_alphanum4')
    })

    it('should initialize the type as credit_alphanum12 based on the code length', () => {
      const asset = new ClassicAssetHandler({
        code: 'CAKECAKECAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.type).toBe('credit_alphanum12')
    })

    it('should initialize the type as native if the code is XLM as has no issuer', () => {
      const asset = new ClassicAssetHandler({
        code: 'XLM',
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.type).toBe('native')
    })

    it('should initialize the type as credit_alphanum4 if the code is XLM as has an issuer', () => {
      const asset = new ClassicAssetHandler({
        code: 'XLM',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.type).toBe('credit_alphanum4')
    })

    it('should accept options for the Classic Transaction pipeline', () => {
      const mockedPlugin = jest.mocked({
        preProcess: jest.fn(),
        postProcess: jest.fn(),
        type: ClassicTransactionPipelineType.id as ClassicTransactionPipelineType,
      }) as unknown as ClassicTransactionPipelinePlugin

      const mockedInnerPlugin = jest.mocked({
        preProcess: jest.fn(),
        postProcess: jest.fn(),
        type: BuildTransactionPipelineType.id as BuildTransactionPipelineType,
      }) as unknown as BuildTransactionPipelinePlugin

      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
        options: {
          classicTransactionPipeline: {
            plugins: [mockedPlugin, mockedInnerPlugin],
          },
        },
      })
      const spyPipeline = jest.mocked((asset as any).classicTransactionPipeline)

      expect(asset).toBeDefined()
      expect(asset).toBeInstanceOf(ClassicAssetHandler)
      expect(spyPipeline.plugins).toContain(mockedPlugin)
      expect(spyPipeline.plugins).not.toContain(mockedInnerPlugin)
      expect(spyPipeline.innerPlugins).toContain(mockedInnerPlugin)
      expect(spyPipeline.innerPlugins).not.toContain(mockedPlugin)
    })
  })

  describe('Core Functionalities', () => {
    let asset: ClassicAssetHandler
    beforeEach(() => {
      jest.clearAllMocks()
      const mockedIssuerAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: mockedIssuerAccountHandler,
        networkConfig: TESTNET_CONFIG,
      })
    })

    it('should be able to get the asset symbol', async () => {
      expect(asset.symbol()).resolves.toBe('CAKE')
    })

    it('should be able to get the decimals', async () => {
      expect(asset.decimals()).resolves.toBe(7) // Currently fixed for classic assets
    })

    it('should be able to get the asset name', async () => {
      expect(asset.name()).resolves.toBe('CAKE') // Currently defaults to code for classic assets
    })

    it('should be able to get the balance of an account for this asset', async () => {
      const mockedBalance = '100.0000000'
      MOCKED_HORIZON_HANDLER.mockImplementationOnce(() => ({
        loadAccount: jest.fn().mockImplementation(() => {
          return {
            balances: [
              {
                asset_code: 'CAKE',
                asset_issuer: MOCKED_PK,
                balance: mockedBalance,
                asset_type: 'credit_alphanum4',
              },
              {
                asset_code: 'CAKECAKECAKE',
                asset_issuer: MOCKED_PK,
                balance: '250',
                asset_type: 'credit_alphanum12',
              },
            ],
          }
        }),
      }))
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.balance(MOCKED_PK)).resolves.toBe(Number(mockedBalance))
    })

    it('should be able to get the balance of an account for this asset if it is native', async () => {
      const mockedBalance = '100.0000000'
      MOCKED_HORIZON_HANDLER.mockImplementationOnce(() => ({
        loadAccount: jest.fn().mockImplementation(() => {
          return {
            balances: [
              {
                asset_code: 'XLM',
                balance: mockedBalance,
                asset_type: 'native',
              },
              {
                asset_code: 'CAKECAKECAKE',
                asset_issuer: MOCKED_PK,
                balance: '250',
                asset_type: 'credit_alphanum12',
              },
            ],
          }
        }),
      }))
      const asset = new ClassicAssetHandler({
        code: 'XLM',
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.balance(MOCKED_PK)).resolves.toBe(Number(mockedBalance))
    })

    it('should return 0 when there is no balance for an account for this asset', async () => {
      MOCKED_HORIZON_HANDLER.mockImplementationOnce(() => ({
        loadAccount: jest.fn().mockImplementation(() => {
          return {
            balances: [
              {
                asset_code: 'CAKECAKECAKE',
                asset_issuer: MOCKED_PK,
                balance: '250',
                asset_type: 'credit_alphanum12',
              },
            ],
          }
        }),
      }))
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })

      expect(asset.balance(MOCKED_PK)).resolves.toBe(0)
    })

    it('should be able to perform a transfer operation for a given account', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const sender = MOCKED_PK
      const receiver = MOCKED_PK_B
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '100', timeout: 45 },
        signers: [mockedAccountHandler],
      }
      const spyExecute = jest.spyOn((asset as any).classicTransactionPipeline, 'execute').mockResolvedValue({})
      const args = {
        from: sender,
        to: receiver,
        amount: 120,
        ...mockedTxInvocation,
      }

      await asset.transfer(args)

      expect(spyExecute).toHaveBeenCalledExactlyOnceWith({
        txInvocation: args as TransactionInvocation,
        operations: ['paymentOp'],
      })
    })

    it('should be able to perform a burn operation for a given account', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const sender = MOCKED_PK
      const issuer = MOCKED_PK_B
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: issuer,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '100', timeout: 45 },
        signers: [mockedAccountHandler],
      }
      const spyTransfer = jest.spyOn(asset as any, 'transfer').mockResolvedValue({})
      const args = {
        from: sender,
        amount: 120,
        ...mockedTxInvocation,
      }

      await asset.burn(args)

      expect(spyTransfer).toHaveBeenCalledExactlyOnceWith({
        ...args,
        to: issuer,
      })
    })

    it('should be able to perform a mint operation to a given account, adding the issuer as signer', async () => {
      const mockedIssuerAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const mockedUserAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK_B })
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: mockedIssuerAccountHandler,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: mockedUserAccountHandler.getPublicKey(), fee: '100', timeout: 45 },
        signers: [mockedUserAccountHandler],
      }
      const spyExecute = jest.spyOn((asset as any).classicTransactionPipeline, 'execute').mockResolvedValue({})
      const args = {
        to: mockedUserAccountHandler.getPublicKey(),
        amount: 120,
        ...mockedTxInvocation,
      }

      await asset.mint(args)

      expect(spyExecute).toHaveBeenCalledExactlyOnceWith({
        txInvocation: {
          ...args,
          signers: [mockedUserAccountHandler, mockedIssuerAccountHandler],
        } as TransactionInvocation,
        operations: ['paymentOp'],
      })
    })

    it('should be able to perform a transaction to add trustline for a given account', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '100', timeout: 45 },
        signers: [mockedAccountHandler],
      }
      const spyExecute = jest.spyOn((asset as any).classicTransactionPipeline, 'execute').mockResolvedValue({})
      const args = {
        to: mockedAccountHandler.getPublicKey(),
        ...mockedTxInvocation,
      }

      await asset.addTrustline(args)

      expect(spyExecute).toHaveBeenCalledExactlyOnceWith({
        txInvocation: args as TransactionInvocation,
        operations: ['changeTrustOp'],
      })
    })

    it('should be able to perform a transaction to add trustline and mint operation to a given account, adding the issuer as signer', async () => {
      const mockedIssuerAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const mockedUserAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK_B })
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: mockedIssuerAccountHandler,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: mockedUserAccountHandler.getPublicKey(), fee: '100', timeout: 45 },
        signers: [mockedUserAccountHandler],
      }
      const spyExecute = jest.spyOn((asset as any).classicTransactionPipeline, 'execute').mockResolvedValue({})
      const args = {
        to: mockedUserAccountHandler.getPublicKey(),
        amount: 120,
        ...mockedTxInvocation,
      }

      await asset.addTrustlineAndMint(args)

      expect(spyExecute).toHaveBeenCalledExactlyOnceWith({
        txInvocation: {
          ...args,
          signers: [mockedUserAccountHandler, mockedIssuerAccountHandler],
        } as TransactionInvocation,
        operations: ['changeTrustOp', 'paymentOp'],
      })
    })
  })

  describe('Error Handling', () => {
    let asset: ClassicAssetHandler
    beforeEach(() => {
      jest.clearAllMocks()
      const mockedIssuerAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: mockedIssuerAccountHandler,
        networkConfig: TESTNET_CONFIG,
      })
    })

    it('should throw an error if trying to approve an account', async () => {
      //Not implemented yet

      expect(asset.approve()).rejects.toThrow('Method not implemented.')
    })

    it('should throw an error if trying to clawback from an account', async () => {
      //Not implemented yet

      expect(asset.clawback()).rejects.toThrow('Method not implemented.')
    })

    it('should throw an error if the function invoked require an issuer handler and it is missing', async () => {
      const asset = new ClassicAssetHandler({
        code: 'CAKE',
        issuerAccount: MOCKED_PK,
        networkConfig: TESTNET_CONFIG,
      })
      const mockedTxInvocation = {
        header: { source: MOCKED_PK_B, fee: '100', timeout: 45 },
        signers: [mockAccountHandler({ accountKey: MOCKED_PK_B })],
      }
      const spyExecute = jest.spyOn((asset as any).classicTransactionPipeline, 'execute').mockResolvedValue({})
      const args = {
        to: MOCKED_PK_B,
        amount: 120,
        ...mockedTxInvocation,
      }

      await expect(asset.addTrustlineAndMint(args)).rejects.toThrow(CAHError.issuerAccountNotDefined())
      expect(spyExecute).not.toHaveBeenCalled()
    })
  })
})
