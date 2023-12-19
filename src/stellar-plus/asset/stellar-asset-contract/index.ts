import { Asset } from '@stellar/stellar-sdk'

import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { ClassicAssetHandlerConstructorArgs } from 'stellar-plus/asset/classic/types'
import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { SACConstructorArgs, SACHandler as SACHandlerType } from 'stellar-plus/asset/stellar-asset-contract/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { TransactionInvocation } from 'stellar-plus/core/types'

import { SorobanTokenHandlerConstructorArgs } from '../soroban-token/types'

export class SACHandler implements SACHandlerType {
  public type: AssetTypes = AssetTypes.SAC
  public classicHandler: ClassicAssetHandler
  public sorobanTokenHandler: SorobanTokenHandler

  /**
   *
   * @param args - The constructor arguments.
   * @param {Network} args.network - The network to connect to.
   * Parameters related to the classic asset.
   * @param {string} args.code - The asset code.
   * @param {string} args.issuerPublicKey - The issuer public key.
   * @param {AccountHandler=} args.issuerAccount - The issuer account.
   * @param {TransactionSubmitter=} args.transactionSubmitter - The classic transaction submitter.
   * Parameters related to the Soroban token.
   * @param {ContractSpec=} args.spec - The contract specification object.
   * @param {Buffer=} args.wasm - The contract wasm file as a buffer.
   * @param {string=} args.wasmHash - The contract wasm hash id.
   * @param {string=} args.contractId - The contract id.
   * @param {RpcHandler=} args.rpcHandler - A custom Soroban RPC handler.
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
   * const issuer = new StellarPlus.Account.DefaultAccountHandler({ network })
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
   * @returns {Promise<void>}
   *
   */
  public async wrapAndDeploy(txInvocation: TransactionInvocation): Promise<void> {
    const asset = new Asset(this.classicHandler.code, this.classicHandler.issuerPublicKey)
    await this.sorobanTokenHandler.wrapAndDeployClassicAsset({ asset, ...txInvocation })
  }
}
