import { ClassicAssetHandler } from 'stellar-plus/asset'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { ClassicTransactionPipelineOutput } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TestNet } from 'stellar-plus/network'
import { mockAccountHandler } from 'stellar-plus/test/mocks/transaction-mock'

import { CLPHError } from './errors'

import { ClassicLiquidityPoolHandler } from '.'

jest.mock('stellar-plus/horizon', () => {
  const liquidityPoolsMock = {
    liquidityPoolId: jest.fn().mockReturnValue({
      call: jest.fn(),
    }),
  }

  const serverMock = {
    liquidityPools: jest.fn().mockReturnValue(liquidityPoolsMock),
  }

  return {
    HorizonHandlerClient: jest.fn().mockImplementation(() => ({
      server: serverMock,
    })),
  }
})

const TESTNET_CONFIG = TestNet()
const MOCKED_PK = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_PK_2 = 'GBGQYSYAYIORCUHVCXA3USJWTTCC3ODFAZBEVWJAREYQEBVEBVHHZMCT'

describe('ClassicLiquidityPoolHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addTrustline', () => {
    it('should add a trustline and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })
      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      jest.spyOn(mockHandler as any, 'checkLiquidityPoolTrustlineExists').mockResolvedValue(false)

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '100', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      const result = await mockHandler.addTrustline({
        to: MOCKED_PK_2,
        fee: 30,
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should throw an error if the trustline already exists', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      jest.spyOn(mockHandler as any, 'checkLiquidityPoolTrustlineExists').mockResolvedValue(true)

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '100', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      await expect(
        mockHandler.addTrustline({
          to: MOCKED_PK,
          fee: 30,
          ...mockedTxInvocation,
        })
      ).rejects.toThrow(CLPHError.trustlineAlreadyExists())
    })
  })

  describe('deposit', () => {
    it('should deposit assets and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.deposit({
        amountA: '100',
        amountB: '100',
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should deposit assets with min/max price string and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.deposit({
        amountA: '100',
        amountB: '100',
        minPrice: '1',
        maxPrice: '1000',
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should deposit assets with min/max price number and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.deposit({
        amountA: '100',
        amountB: '100',
        minPrice: 1,
        maxPrice: 1000,
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should deposit assets with min/max price object and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.deposit({
        amountA: '100',
        amountB: '100',
        minPrice: { n: 1, d: 1 },
        maxPrice: { n: 1, d: 1 },
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should throw an error if min/max amount is a wrong object', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      await expect(
        mockHandler.deposit({
          amountA: '100',
          amountB: '100',
          minPrice: {},
          maxPrice: {},
          ...mockedTxInvocation,
        })
      ).rejects.toThrow('[BigNumber Error] Not a number: [object Object]')
    })

    it('should throw an error if min/max amount is a wrong object with invalid value', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      await expect(
        mockHandler.deposit({
          amountA: '100',
          amountB: '100',
          minPrice: { n: 1, e: 1 },
          maxPrice: { n: 1, e: 1 },
          ...mockedTxInvocation,
        })
      ).rejects.toThrow('[BigNumber Error] Not a number: [object Object]')
    })

    it('should throw an error if liquidity pool ID is not defined', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      await expect(
        mockHandler.deposit({
          amountA: '100',
          amountB: '100',
          ...mockedTxInvocation,
        })
      ).rejects.toThrow(CLPHError.liquidityPoolIdNotDefined())
    })
  })

  describe('withdraw', () => {
    it('should withdraw assets and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.withdraw({
        amount: '100',
        minAmountA: '50',
        minAmountB: '50',
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should withdraw assets without minAmount and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.withdraw({
        amount: '100',
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })

    it('should withdraw assets with a large amount and return a transaction result', async () => {
      const mockedAccountHandler = mockAccountHandler({ accountKey: MOCKED_PK })

      const mockHandler = new ClassicLiquidityPoolHandler({
        assetA: { code: 'CAKE', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        assetB: { code: 'CAKF', issuerPublicKey: MOCKED_PK } as ClassicAssetHandler,
        networkConfig: TESTNET_CONFIG,
      })

      const mockedTxInvocation = {
        header: { source: MOCKED_PK, fee: '30', timeout: 45 },
        signers: [mockedAccountHandler],
      }

      mockHandler.liquidityPoolId = '36ce20d2acb46bee9d7fa8024122b20bb29ade2b62ba0968d6153bb29c0f6ec3'

      ClassicTransactionPipeline.prototype.execute = jest.fn().mockResolvedValue({
        txResult: 'mockTxResult',
      } as unknown as ClassicTransactionPipelineOutput)

      const result = await mockHandler.withdraw({
        amount: '989855478',
        ...mockedTxInvocation,
      })

      expect(result).toEqual({ txResult: 'mockTxResult' })
      expect(ClassicTransactionPipeline.prototype.execute).toHaveBeenCalled()
    })
  })
})
