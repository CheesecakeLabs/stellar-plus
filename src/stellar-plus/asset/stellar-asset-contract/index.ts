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
   * @param {string} code - The asset code.
   * @param {string} issuerPublicKey - The public key of the asset issuer.
   * @param {Network} network - The network to use.
   * @param {AccountHandler=} issuerAccount - The issuer account handler. When provided, it'll enable management functions and be used to sign transactions as the issuer.
   * @param {TransactionSubmitter=} transactionSubmitter - The transaction submitter to use.
   *
   * @description - The Classic asset handler is used for handling classic assets with user-based and management functionalities.
   *
   *
   */
  constructor(args: SACConstructorArgs) {
    this.classicHandler = new ClassicAssetHandler(args as ClassicAssetHandlerConstructorArgs)
    this.sorobanTokenHandler = new SorobanTokenHandler(args as SorobanTokenHandlerConstructorArgs)
  }

  public async wrapAndDeploy(txInvocation: TransactionInvocation): Promise<void> {
    const asset = new Asset(this.classicHandler.code, this.classicHandler.issuerPublicKey)
    await this.sorobanTokenHandler.wrapAndDeployClassicAsset({ asset, ...txInvocation })
  }
}
