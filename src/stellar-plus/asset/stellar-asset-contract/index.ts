import { Horizon as HorizonNamespace, Asset as StellarAsset } from '@stellar/stellar-sdk'

import { AccountHandler } from '@account/account-handler/types'
import { ClassicAssetHandler } from '@asset/classic'
import { ClassicAssetHandlerConstructorArgs } from '@asset/classic/types'
import { SACConstructorArgs, SACHandler as SACHandlerType } from '@asset/stellar-asset-contract/types'
import { AssetTypes } from '@asset/types'
import { SorobanTransactionProcessor } from '@core/soroban-transaction-processor'
import { TransactionInvocation } from '@core/types'
import { i128 } from '@stellar-plus/types'

export class SACHandler extends SorobanTransactionProcessor implements SACHandlerType {
  public code: string
  public issuerPublicKey: string
  public type: AssetTypes.native | AssetTypes.credit_alphanum4 | AssetTypes.credit_alphanum12
  public classicHandler: ClassicAssetHandler
  private issuerAccount?: AccountHandler
  private asset: StellarAsset
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
    super(args.network, args.rpcHandler)
    this.code = args.code
    this.issuerPublicKey = args.issuerPublicKey
    this.type =
      args.code === 'XLM'
        ? AssetTypes.native
        : args.code.length <= 4
          ? AssetTypes.credit_alphanum4
          : AssetTypes.credit_alphanum12

    this.asset = new StellarAsset(args.code, args.issuerPublicKey)
    this.issuerAccount = args.issuerAccount

    this.classicHandler = new ClassicAssetHandler(args as ClassicAssetHandlerConstructorArgs)
  }

  //==========================================
  // User Methods - Do not require Admin / Issuer
  //==========================================
  //
  //

  /**
   *
   * @returns {string} The asset code.
   */
  public async symbol(): Promise<string> {
    return this.code
  }

  /**
   *
   * @returns {number} The asset decimals.
   * @description - Default for classic assets = 7.
   * @todo Improve to get the actual value from the asset issuer's toml file.
   */
  public async decimals(): Promise<number> {
    return 7
  }

  /**
   *
   * @returns {string} The asset code.
   * @todo Improve to get the actual name from the asset issuer's toml file.
   */
  public async name(): Promise<string> {
    return this.code
  }

  /**
   * @description - Not implemented in pure classic assets. Only available for Soroban assets.
   */
  public async allowance(): Promise<bigint> {
    throw new Error('Method not implemented in Classic ssets.')
  }

  public async approve(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @param {string} id - The account id to check the balance for.
   * @returns {Promise<number>} The balance of the asset for the given account.
   */
  public async balance(): Promise<number> {
    throw new Error('Method not implemented.')
  }

  public async spendable_balance(): Promise<i128> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @param {string} from - The account id to transfer the asset from.
   * @param {string} to - The account id to transfer the asset to.
   * @param {i128} amount - The amount of the asset to transfer.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object. Must include the 'From' account as a signer to authorize this transaction.
   *
   * @requires - The 'from' account to be set as a signer in the transaction invocation.
   *
   * @returns {Promise<void>}
   *
   * @description - Transfers the given amount of the asset from the 'from' account to the 'to' account.
   */
  public async transfer(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async transfer_from(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async burn(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async burn_from(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  //==========================================
  // Management Methods - Require Admin / Issuer account
  //==========================================
  //
  //

  public async set_admin(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  public async admin(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  public async set_authorized(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @param {string} to - The account id to mint the asset to.
   * @param {i128} amount - The amount of the asset to mint.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object. The Issuer account will be automatically added as a signer.
   *
   * @description - Mints the given amount of the asset to the 'to' account.
   * @requires - The issuer account to be set in the asset.
   *
   * @returns {HorizonNamespace.SubmitTransactionResponse} The response from the Horizon server.
   */
  public async mint(): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    throw new Error('Method not implemented.')
  }

  public async clawback(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  //==========================================
  // Util Methods
  //==========================================
  //
  //

  /**
   *
   * @returns {string} The contract Id of the SAC for this classic asset on Soroban.
   * @description Provides the SAC contract Id for this classic asset on Soroban. The id is generated in a deterministic way and does not mean the asset is already wrapped and deployed on Soroban.
   */
  public getContractId(): string {
    // TODO: remove once it is fixed in the library
    // refer to issue https://github.com/stellar/js-stellar-base/issues/717
    // @ts-expect-error wrong type in library
    return this.asset.contractId(this.network.networkPassphrase)
  }

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation object.
   * @returns {string} The contract Id of the deployed asset.
   * @description - Wraps the classic asset and deploys the SAC on Soroban.
   */
  public async wrapAndDeploy(txInvocation: TransactionInvocation): Promise<string> {
    const result = await this.wrapClassicAsset({ asset: this.asset, ...txInvocation })

    return result
  }

  //==========================================
  // Internal Methods
  //==========================================
  //

  /**
   *
   * @description - Enforces the issuer account to be set.
   */
  private requireIssuerAccount(): void {
    if (!this.issuerAccount) {
      throw new Error('Issuer account not set!')
    }
  }
}
