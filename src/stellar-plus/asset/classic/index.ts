import { Horizon as HorizonNamespace, Operation, Asset as StellarAsset } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import {
  ClassicAssetHandlerConstructorArgs,
  ClassicAssetHandler as IClassicAssetHandler,
} from 'stellar-plus/asset/classic/types'
import { AssetTypes } from 'stellar-plus/asset/types'
import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { i128 } from 'stellar-plus/types'

import { CAHError } from './errors'
import { ClassicTransactionPipelineOptions } from 'stellar-plus/core/pipelines/classic-transaction/types'

export class ClassicAssetHandler extends TransactionProcessor implements IClassicAssetHandler {
  public code: string
  public issuerPublicKey: string
  public type: AssetTypes.native | AssetTypes.credit_alphanum4 | AssetTypes.credit_alphanum12
  private issuerAccount?: AccountHandler
  private asset: StellarAsset

  private classicTrasactionPipeline: ClassicTransactionPipeline

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
  constructor(args: ClassicAssetHandlerConstructorArgs) {
    super({ ...args })
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

    this.classicTrasactionPipeline = new ClassicTransactionPipeline(
      args.options?.clasicTransactionPipeline as ClassicTransactionPipelineOptions
    )
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

  // /**
  //  * @description - Not implemented in pure classic assets. Only available for Soroban assets.
  //  */
  // public async allowance(): Promise<bigint> {
  //   throw new Error('Method not implemented in Classic ssets.')
  // }

  public async approve(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @param {string} id - The account id to check the balance for.
   * @returns {Promise<number>} The balance of the asset for the given account.
   */
  public async balance(id: string): Promise<number> {
    const sourceAccount = (await this.horizonHandler.loadAccount(id)) as HorizonNamespace.AccountResponse
    const balanceLine = sourceAccount.balances.filter((balanceLine: HorizonNamespace.HorizonApi.BalanceLine) => {
      if (balanceLine.asset_type === this.type && balanceLine.asset_type === AssetTypes.native) {
        return true
      }

      if (
        balanceLine.asset_type === AssetTypes.credit_alphanum12 ||
        balanceLine.asset_type === AssetTypes.credit_alphanum4
      ) {
        if (balanceLine.asset_code === this.code && balanceLine.asset_issuer === this.issuerPublicKey) return true
      }

      return false
    })

    return balanceLine[0] ? Number(balanceLine[0].balance) : 0
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
  public async transfer(args: { from: string; to: string; amount: number } & TransactionInvocation): Promise<void> {
    const { from, to, amount } = args

    const txInvocation = args as TransactionInvocation

    const transferOp = Operation.payment({
      destination: to,
      asset: this.asset,
      amount: amount.toString(),
      source: from,
    })

    await this.classicTrasactionPipeline.execute({
      txInvocation,
      operations: [transferOp],
    })

    return
  }

  public async OLDtransfer(args: { from: string; to: string; amount: number } & TransactionInvocation): Promise<void> {
    const { from, to, amount, header, signers, feeBump } = args

    const txInvocation = {
      header,
      signers,
      feeBump,
    }
    const { envelope, updatedTxInvocation } = await this.transactionSubmitter.createEnvelope(txInvocation)

    // const { updatedHeader, updatedSigners, updatedFeeBump } = updatedTxInvocation

    const tx = envelope
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: from,
        })
      )
      .setTimeout(updatedTxInvocation.header.timeout)
      .build()

    this.verifySigners([from], updatedTxInvocation.signers)
    await this.processTransaction(tx, updatedTxInvocation.signers, updatedTxInvocation.feeBump)

    return
  }

  // public async transfer_from(): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }

  // public async burn_from(): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }

  /**
   *
   * @param {string} from - The account id to burn the asset from.
   * @param {number} amount - The amount of the asset to burn.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object. Must include the 'From' account as a signer to authorize this transaction.
   *
   * @requires - The 'from' account to be set as a signer in the transaction invocation.
   *
   * @returns {Promise<void>}
   *
   * @description - Burns the given amount of the asset from the 'from' account.
   */
  public async burn(args: { from: string; amount: number } & TransactionInvocation): Promise<void> {
    return this.transfer({ ...args, to: this.issuerPublicKey })
  }

  //==========================================
  // Management Methods - Require Admin / Issuer account
  //==========================================
  //
  //

  // public async set_admin(): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }
  // public async admin(): Promise<string> {
  //   throw new Error('Method not implemented.')
  // }
  // public async set_authorized(): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }

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
  public async mint(
    args: {
      to: string
      amount: number
    } & TransactionInvocation
  ): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    this.requireIssuerAccount() // Enforces the issuer account to be set.

    const { to, amount } = args

    const { envelope, updatedTxInvocation } = await this.transactionSubmitter.createEnvelope({ ...args })

    const tx = envelope
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: this.asset.getIssuer(),
        })
      )
      .setTimeout(updatedTxInvocation.header.timeout)
      .build()

    const signersWithIssuer = [...updatedTxInvocation.signers, this.issuerAccount!]

    this.verifySigners([this.asset.getIssuer()], signersWithIssuer)

    return await this.processTransaction(tx, signersWithIssuer, updatedTxInvocation.feeBump)
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
   * @param {string} to - The account id to mint the asset to.
   * @param {number} amount - The amount of the asset to mint.
   * @param {TransactionInvocation} txInvocation - The transaction invocation object. The  The Issuer account will be automatically added as a signer.
   *
   * @requires - The issuer account to be set in the asset.
   * @requires - The 'to' account to be set as a signer in the transaction invocation.
   *
   * @description - Mints the given amount of the asset to the 'to' account. The trustline is also set in process.
   *
   * @returns {HorizonNamespace.SubmitTransactionResponse} The response from the Horizon server.
   */
  public async addTrustlineAndMint(
    args: {
      to: string
      amount: number
    } & TransactionInvocation
  ): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    this.requireIssuerAccount() // Enforces the issuer account to be set.

    const { to, amount } = args

    const { envelope, updatedTxInvocation } = await this.transactionSubmitter.createEnvelope({ ...args })

    const { header, signers, feeBump } = updatedTxInvocation

    const tx = envelope
      .addOperation(
        Operation.changeTrust({
          source: to,
          asset: this.asset,
        })
      )
      .addOperation(
        Operation.payment({
          destination: to,
          asset: this.asset,
          amount: amount.toString(),
          source: this.asset.getIssuer(),
        })
      )
      .setTimeout(header.timeout)
      .build()

    const signersWithIssuer = [...signers, this.issuerAccount!]
    this.verifySigners([to, this.asset.getIssuer()], signersWithIssuer)

    return await this.processTransaction(tx, signersWithIssuer, feeBump)
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
      throw CAHError.issuerAccountNotDefined()
    }
  }
}
