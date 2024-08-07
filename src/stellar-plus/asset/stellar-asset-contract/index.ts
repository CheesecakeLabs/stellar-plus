import { Asset } from '@stellar/stellar-sdk'

import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { ClassicAssetHandlerConstructorArgs } from 'stellar-plus/asset/classic/types'
import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { SorobanTokenHandlerConstructorArgs } from 'stellar-plus/asset/soroban-token/types'
import { SACConstructorArgs, SACHandler as SACHandlerType } from 'stellar-plus/asset/stellar-asset-contract/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { BaseInvocation } from 'stellar-plus/core/contract-engine/types'
import { SorobanTransactionPipelineOutput } from 'stellar-plus/core/pipelines/soroban-transaction/types'

export class SACHandler implements SACHandlerType {
  public type: AssetTypes = AssetTypes.SAC

  public classicHandler: ClassicAssetHandler
  public sorobanTokenHandler: SorobanTokenHandler

  /**
   *
   * @param args - The constructor arguments.
   * @param {NetworkConfig} args.networkConfig - The network to connect to.
   * Parameters related to the classic asset.
   * @param {string} args.code - The asset code.
   * @param {string | AccountHandler} args.issuerAccount - The issuer account. Can be a public key or an account handler. If it's an account handler, it will enable management functions.
   * @param contractParameters - The contract parameters.
   * @param {Spec=} contractParameters.spec - The contract specification object.
   * @param {Buffer=} contractParameters.wasm - The contract wasm file as a buffer.
   * @param {string=} contractParameters.wasmHash - The contract wasm hash id.
   * @param {string=} contractParameters.contractId - The contract id.
   * @param options - The contract options.
   * @param {SorobanTransactionPipelineOptions=} options.sorobanTransactionPipeline - The Soroban transaction pipeline.
   * @param { ClassicTransactionPipelineOptions=} options.classicTransactionPipeline - The classic transaction pipeline.
   *
   *
   * @description - The Stellar Asset Contract handler. It combines the classic asset handler and the Soroban token handler.
   * Allows to wrap and deploy the classic asset with the Stellar Asset Contract and to use both Classic and Soroban interfaces.
   *
   * @returns {void}
   *
   * @example - Initialize the Stellar Asset Contract handler and wrapping a classic asset with it:
   *
   * ```typescript
   * const issuer = new StellarPlus.Account.DefaultAccountHandler({ networkConfig })
   * await issuer.friendbot?.initialize()
   *
   * const issuerInvocation: TransactionInvocation = {
   *  header: {
   *    source: issuer.getPublicKey(),
   *    fee: '10000000', // 1 XLM max fee
   *    timeout: 30,
   *  },
   *  signers: [issuer],
   * }
   *
   * const asset = new StellarPlus.Asset.SACHandler({
   *  network,
   *  code: 'CAKE',
   *  issuerPublicKey: issuer.getPublicKey(),
   *  issuerAccount: issuer,
   * })
   *
   * await asset.wrapAndDeploy(issuerInvocation)
   *
   * // From this  point on, the asset is wrapped and deployed with the Stellar Asset Contract.
   * // You'll be able to use both the classic and the Soroban interfaces fully.
   *
   */
  constructor(args: SACConstructorArgs) {
    this.classicHandler = new ClassicAssetHandler(args as ClassicAssetHandlerConstructorArgs)
    this.sorobanTokenHandler = new SorobanTokenHandler(args as SorobanTokenHandlerConstructorArgs)
  }

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation object.
   * @param {EnvelopeHeader} txInvocation.header - The transaction header.
   * @param {Account[]} txInvocation.signers - The transaction signers.
   * @param {TransactionInvocation=} txInvocation.feeBump - The fee bump transaction invocation object.
   *
   * @description - Wraps and deploys the classic asset with the Stellar Asset Contract.
   *
   * @returns {Promise<SorobanTransactionPipelineOutput | void>}
   *
   */
  public async wrapAndDeploy(args: BaseInvocation): Promise<SorobanTransactionPipelineOutput | void> {
    const asset = new Asset(this.classicHandler.code, this.classicHandler.issuerPublicKey)
    return await this.sorobanTokenHandler.wrapAndDeployClassicAsset({ asset, ...args })
  }
}
