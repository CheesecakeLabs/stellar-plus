import { getLiquidityPoolId, LiquidityPoolAsset, Operation, Asset as StellarAsset } from '@stellar/stellar-sdk'
import {
  BaseInvocation,
  ClassicLiquidityPoolHandlerConstructorArgs,
  ClassicLiquidityPoolHandlerInstanceArgs,
  ClassicLiquidityPoolHandler as IClassicLiquidityPoolHandler,
} from 'stellar-plus/markets/classic-liquidity-pool/types'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { ClassicTransactionPipelineOutput } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'

import { CLPHError } from './errors'
import { ClassicAssetHandler } from 'stellar-plus/asset'
import { HorizonHandlerClient } from 'stellar-plus/horizon'

/**
 * Constants
 */
const LIQUIDITY_POOL_SHARE_TYPE = 'liquidity_pool_shares'
const LIQUIDITY_POOL_MODEL = 'constant_product'

/**
 * Handler for managing a classic liquidity pool on the Stellar network.
 */
export class ClassicLiquidityPoolHandler implements IClassicLiquidityPoolHandler {
  public assetA: ClassicAssetHandler
  public assetB: ClassicAssetHandler
  public liquidityPoolId?: string

  private classicTransactionPipeline: ClassicTransactionPipeline
  private horizonHandler: HorizonHandlerClient

  constructor(args: ClassicLiquidityPoolHandlerConstructorArgs) {
    this.assetA = args.assetA
    this.assetB = args.assetB
    this.horizonHandler = new HorizonHandlerClient(args.networkConfig)

    this.classicTransactionPipeline = new ClassicTransactionPipeline(
      args.networkConfig,
      args.options?.classicTransactionPipeline
    )
  }

  /**
   * Create an instance from a liquidity pool ID.
   */
  public static async fromLiquidityPoolId(
    args: ClassicLiquidityPoolHandlerInstanceArgs
  ): Promise<ClassicLiquidityPoolHandler> {
    const { liquidityPoolId, networkConfig, options } = args
    const horizonHandler = new HorizonHandlerClient(networkConfig)

    try {
      const liquidityPool = await horizonHandler.server.liquidityPools().liquidityPoolId(liquidityPoolId).call()

      // Check if the liquidity pool exists
      if (!liquidityPool) {
        throw CLPHError.liquidityPoolNotFound()
      }

      // Extract assets from the liquidity pool
      const [reserveA, reserveB] = liquidityPool.reserves
      if (!reserveA || !reserveB) {
        throw CLPHError.liquidityPoolRequiredAssets()
      }

      const [assetCodeA, assetIssuerA] = reserveA.asset.split(':')
      const [assetCodeB, assetIssuerB] = reserveB.asset.split(':')

      // Creates instances of ClassicAssetHandler for each asset
      const assetA = new ClassicAssetHandler({
        code: assetCodeA,
        issuerAccount: assetIssuerA,
        networkConfig: networkConfig,
      })

      const assetB = new ClassicAssetHandler({
        code: assetCodeB,
        issuerAccount: assetIssuerB,
        networkConfig: networkConfig,
      })

      // Create an instance using the extracted assets
      const handler = new ClassicLiquidityPoolHandler({
        assetA,
        assetB,
        networkConfig: networkConfig,
        options: options,
      })

      handler.liquidityPoolId = liquidityPoolId

      return handler
    } catch (error) {
      throw CLPHError.failedToCreateHandlerFromLiquidityPoolId()
    }
  }

  /**
   * Adds a trustline for the liquidity pool asset to the specified account.
   */
  public async addTrustline(
    args: { to: string; fee?: number } & BaseInvocation
  ): Promise<ClassicTransactionPipelineOutput> {
    const { to, fee = 30 } = args
    const txInvocation = args as TransactionInvocation

    const assetA = this.createStellarAsset(this.assetA)
    const assetB = this.createStellarAsset(this.assetB)
    const liquidityPoolAsset = new LiquidityPoolAsset(assetA, assetB, fee)

    this.liquidityPoolId = getLiquidityPoolId(LIQUIDITY_POOL_MODEL, liquidityPoolAsset).toString('hex')
    const operations = []

    // Check if the trustline already exists.
    const trustlineExists = await this.checkLiquidityPoolTrustlineExists(to)
    if (trustlineExists) {
      throw CLPHError.trustlineAlreadyExists()
    }

    // Check if the liquidity pool already exists.
    const liquidityPoolExists = await this.checkLiquidityPoolExists()
    if (!liquidityPoolExists) {
      operations.push(Operation.changeTrust({ asset: liquidityPoolAsset }))
    }

    const addTrustlineOperation = Operation.changeTrust({ source: to, asset: liquidityPoolAsset })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [...operations, addTrustlineOperation],
      options: { ...args.options },
    })

    return result
  }

  /**
   * Checks if the trustline for the liquidity pool exists.
   */
  private async checkLiquidityPoolTrustlineExists(accountId: string): Promise<boolean> {
    try {
      const account = await this.horizonHandler.loadAccount(accountId)
      return account.balances.some(
        (balance) =>
          balance.asset_type === LIQUIDITY_POOL_SHARE_TYPE && balance.liquidity_pool_id === this.liquidityPoolId
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Helper to create Stellar Asset from ClassicAssetHandler.
   */
  private createStellarAsset(assetHandler: ClassicAssetHandler): StellarAsset {
    return new StellarAsset(assetHandler.code, assetHandler.issuerPublicKey)
  }

  /**
   * Check if the Liquidity Pool already exists.
   */
  private async checkLiquidityPoolExists(): Promise<boolean> {
    try {
      const liquidtyPool = await this.horizonHandler.server
        .liquidityPools()
        .liquidityPoolId(this.liquidityPoolId!)
        .call()

      console.log(liquidtyPool)

      return !!liquidtyPool
    } catch {
      return false
    }
  }

  /**
   * Deposits assets into the liquidity pool.
   */
  public async deposit(
    args: {
      amountA: string
      amountB: string
      minPrice?: number | string | object
      maxPrice?: number | string | object
    } & BaseInvocation
  ): Promise<ClassicTransactionPipelineOutput> {
    const { amountA, amountB, minPrice = { n: 1, d: 1 }, maxPrice = { n: 1, d: 1 } } = args
    const txInvocation = args as TransactionInvocation

    if (!this.liquidityPoolId) {
      throw CLPHError.liquidityPoolIdNotDefined()
    }

    const depositOperation = Operation.liquidityPoolDeposit({
      liquidityPoolId: this.liquidityPoolId,
      maxAmountA: amountA,
      maxAmountB: amountB,
      minPrice,
      maxPrice,
    })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [depositOperation],
      options: { ...args.options },
    })

    return result
  }

  /**
   * Withdraws assets from the liquidity pool.
   */
  public async withdraw(
    args: { amount: string; minAmountA?: string; minAmountB?: string } & BaseInvocation
  ): Promise<ClassicTransactionPipelineOutput> {
    const { amount, minAmountA = '0', minAmountB = '0' } = args
    const txInvocation = args as TransactionInvocation

    if (!this.liquidityPoolId) {
      throw CLPHError.liquidityPoolIdNotDefined()
    }

    const withdrawOperation = Operation.liquidityPoolWithdraw({
      liquidityPoolId: this.liquidityPoolId,
      amount,
      minAmountA,
      minAmountB,
    })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [withdrawOperation],
      options: { ...args.options },
    })

    return result
  }
}
