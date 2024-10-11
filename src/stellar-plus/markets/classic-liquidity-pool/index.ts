import { LiquidityPoolAsset, Operation, Asset as StellarAsset, getLiquidityPoolId } from '@stellar/stellar-sdk'

import { ClassicAssetHandler } from 'stellar-plus/asset'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { ClassicTransactionPipelineOutput } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon'
import {
  BaseInvocation,
  ClassicLiquidityPoolHandlerConstructorArgs,
  ClassicLiquidityPoolHandlerInstanceArgs,
  ClassicLiquidityPoolHandler as IClassicLiquidityPoolHandler,
} from 'stellar-plus/markets/classic-liquidity-pool/types'

import { CLPHError } from './errors'

/**
 * Constants
 */
const LIQUIDITY_POOL_SHARE_TYPE = 'liquidity_pool_shares'
const LIQUIDITY_POOL_MODEL = 'constant_product'

export class ClassicLiquidityPoolHandler implements IClassicLiquidityPoolHandler {
  public assetA: ClassicAssetHandler
  public assetB: ClassicAssetHandler
  public liquidityPoolId?: string

  private classicTransactionPipeline: ClassicTransactionPipeline
  private horizonHandler: HorizonHandlerClient

  /**
   * @class ClassicLiquidityPoolHandler
   * @implements {IClassicLiquidityPoolHandler}
   *
   * @param {ClassicAssetHandler} assetA - The first asset in the liquidity pool.
   * @param {ClassicAssetHandler} assetB - The second asset in the liquidity pool.
   * @param {NetworkConfig} networkConfig - The network configuration to use for Stellar.
   * @param {ClassicTransactionPipelineOptions} [options] - Optional configurations.
   * @param {ClassicTransactionPipelineOptions} [options.classicTransactionPipeline] - Custom configurations for the transaction pipeline.
   *
   * @description A handler class for managing a classic liquidity pool on the Stellar network.
   */
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
   * @static
   * @param {string} liquidityPoolId - The ID of the liquidity pool on the Stellar network.
   * @param {NetworkConfig} networkConfig - The network configuration to use.
   * @param {Object} [options] - Optional configurations.
   *
   * @returns {Promise<ClassicLiquidityPoolHandler>} - A promise that resolves to a new instance of the ClassicLiquidityPoolHandler.
   *
   * @description - Creates an instance from a liquidity pool ID.
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
   * @param {string} to - The account to which the trustline should be added.
   * @param {number} [fee=30] - The fee for the trustline transaction.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object
   *
   * @returns {Promise<ClassicTransactionPipelineOutput>} - The result of the add trustline transaction.
   *
   * @description - Adds a trustline for the liquidity pool asset to the specified account.
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

    // Check if the trustline already exists.
    const trustlineExists = await this.checkLiquidityPoolTrustlineExists(to)
    if (trustlineExists) {
      throw CLPHError.trustlineAlreadyExists()
    }

    const addTrustlineOperation = Operation.changeTrust({ source: to, asset: liquidityPoolAsset })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [addTrustlineOperation],
      options: { ...args.options },
    })

    return result
  }

  /**
   * @private
   * @param {string} accountId - The ID of the account to check for an existing trustline.
   * @returns {Promise<boolean>} - Whether the trustline for the liquidity pool exists.
   *
   * @description - Checks if the trustline for the liquidity pool exists.
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
   * @private
   * @param {ClassicAssetHandler} assetHandler - The asset handler for creating a Stellar asset.
   * @returns {StellarAsset} - The created Stellar asset.
   *
   * @description - Helper to create Stellar Asset from ClassicAssetHandler.
   */
  private createStellarAsset(assetHandler: ClassicAssetHandler): StellarAsset {
    return new StellarAsset(assetHandler.code, assetHandler.issuerPublicKey)
  }

  /**
   * @param {string} amountA - The amount of asset A to deposit.
   * @param {string} amountB - The amount of asset B to deposit.
   * @param {number|string|object} [minPrice={n:1,d:1}] - Minimum price for the deposit transaction.
   * @param {number|string|object} [maxPrice={n:1,d:1}] - Maximum price for the deposit transaction.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object
   *
   * @returns {Promise<ClassicTransactionPipelineOutput>} - The result of the deposit transaction.
   *
   * @description - Deposits assets into the liquidity pool.
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
   * @param {string} amount - The amount of liquidity pool shares to withdraw.
   * @param {string} [minAmountA='0'] - Minimum amount of asset A to receive.
   * @param {string} [minAmountB='0'] - Minimum amount of asset B to receive.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object
   *
   * @returns {Promise<ClassicTransactionPipelineOutput>} - The result of the withdrawal transaction.
   *
   * @description - Withdraws assets from the liquidity pool.
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
