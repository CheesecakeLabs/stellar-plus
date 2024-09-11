import { getLiquidityPoolId, LiquidityPoolAsset, Operation, Asset as StellarAsset } from '@stellar/stellar-sdk'

import {
  BaseInvocation,
  ClassicLiquidityPoolHandlerConstructorArgs,
  ClassicLiquidityPoolHandler as IClassicLiquidityPoolHandler,
} from 'stellar-plus/markets/classic-liquidity-pool/types'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { ClassicTransactionPipelineOutput } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'

import { CLPHError } from './errors'
import { ClassicAssetHandler } from 'stellar-plus/asset'
import { HorizonHandlerClient } from 'stellar-plus/horizon'

/**
 * Handler for managing a classic liquidity pool on the Stellar network.
 */
export class ClassicLiquidityPoolHandler implements IClassicLiquidityPoolHandler {
  public assetA: ClassicAssetHandler
  public assetB: ClassicAssetHandler
  public liquidityPoolId?: string

  private classicTransactionPipeline: ClassicTransactionPipeline
  private horizonHandler: HorizonHandlerClient

  /**
   * Creates an instance of ClassicLiquidityPoolHandler.
   *
   * @param {ClassicLiquidityPoolHandlerConstructorArgs} args - The constructor arguments.
   * @param {ClassicAssetHandler} args.assetA - The first asset in the liquidity pool.
   * @param {ClassicAssetHandler} args.assetB - The second asset in the liquidity pool.
   * @param {NetworkConfig} args.networkConfig - The network configuration to use.
   * @param {ClassicTransactionPipelineOptions} [args.options] - Optional settings for the transaction pipeline.
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
   * Adds a trustline for the liquidity pool asset to the specified account.
   *
   * @param {object} args - The function arguments.
   * @param {string} args.to - The account ID to which the trustline will be added.
   * @param {BaseInvocation} args - Additional transaction invocation details.
   * @returns {Promise<ClassicTransactionPipelineOutput>} The response from the Horizon server.
   */
  public async addTrustline(args: { to: string } & BaseInvocation): Promise<ClassicTransactionPipelineOutput> {
    const { to } = args

    const txInvocation = args as TransactionInvocation

    // Initialize pool assets
    const assetA = new StellarAsset(this.assetA.code, this.assetA.issuerPublicKey)
    const assetB = new StellarAsset(this.assetB.code, this.assetB.issuerPublicKey)

    // Create Liquidity Pool asset
    const liquidityPoolAsset = new LiquidityPoolAsset(assetA, assetB, 30)
    this.liquidityPoolId = getLiquidityPoolId('constant_product', liquidityPoolAsset).toString('hex')

    // Validate if liquidity pool trustline exists
    const operations = []
    try {
      const findLiquidityPoolId = await this.horizonHandler.server
        .liquidityPools()
        .liquidityPoolId(this.liquidityPoolId)
        .call()

      if (!findLiquidityPoolId) {
        operations.push(Operation.changeTrust({ asset: liquidityPoolAsset }))
      }
    } catch {
      operations.push(Operation.changeTrust({ asset: liquidityPoolAsset }))
    }

    // Validate if the account already has a trustline with the liquidity pool
    const account = await this.horizonHandler.loadAccount(to)
    const trustlineExists = account.balances.some(
      (balance) => balance.asset_type === 'liquidity_pool_shares' && balance.liquidity_pool_id === this.liquidityPoolId
    )
    if (trustlineExists) {
      throw CLPHError.trustlineAlreadyExists()
    }

    // Create trustline between account and liquidity pool
    const asd = Operation.changeTrust({ asset: liquidityPoolAsset })
    const addAccountTrustline = Operation.changeTrust({ source: to, asset: liquidityPoolAsset })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [asd, addAccountTrustline],
      options: { ...args.options },
    })

    return result
  }

  /**
   * Deposits assets into the liquidity pool.
   *
   * @param {object} args - The function arguments.
   * @param {string} args.amountA - The amount of asset A to deposit.
   * @param {string} args.amountB - The amount of asset B to deposit.
   * @param {BaseInvocation} args - Additional transaction invocation details.
   * @returns {Promise<ClassicTransactionPipelineOutput>} The response from the Horizon server.
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
      minPrice: minPrice,
      maxPrice: maxPrice,
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
   *
   * @param {object} args - The function arguments.
   * @param {string} args.amount - The amount of pool shares to withdraw.
   * @param {BaseInvocation} args - Additional transaction invocation details.
   * @returns {Promise<ClassicTransactionPipelineOutput>} The response from the Horizon server.
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
      minAmountA: minAmountA,
      minAmountB: minAmountB,
    })

    const result = await this.classicTransactionPipeline.execute({
      txInvocation,
      operations: [withdrawOperation],
      options: { ...args.options },
    })

    return result
  }
}
