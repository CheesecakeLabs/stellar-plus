import { TransactionBuilder } from 'stellar-base'
import {
  Transaction as ClassicTransaction,
  TransactionBuilder as ClassicTxBuild,
  Horizon as HorizonNamespace,
} from 'stellar-sdk'

import { TransactionSubmitter as TransactionSubmitter } from '@core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from '@core/types'
import { HorizonHandlerClient } from '@horizon/index'
import { HorizonHandler } from '@horizon/types'
import { Network, Transaction } from '@stellar-plus/types'

export class DefaultTransactionSubmitter implements TransactionSubmitter {
  private feeBump?: FeeBumpHeader
  private network: Network
  private horizonHandler: HorizonHandler

  /**
   *
   * @param {Network} network - The network to use.
   * @param {FeeBumpHeader=} feeBump - The fee bump header to use for wrapping transactions. If not provided during the invocations, this default fee bump header will be used.
   *
   * @description - The default transaction submitter is used for submitting transactions using a single account.
   *
   */
  constructor(network: Network, feeBump?: FeeBumpHeader) {
    this.network = network
    this.horizonHandler = new HorizonHandlerClient(network)
    this.feeBump = feeBump
  }

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation to create the envelope for.
   *
   * @description - Creates the transaction envelope for the given transaction invocation.
   *
   * @returns {{envelope: TransactionBuilder, updatedTxInvocation: TransactionInvocation}} The transaction envelope and the updated transaction invocation.
   */
  public async createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder
    updatedTxInvocation: TransactionInvocation
  }> {
    const { header } = txInvocation
    if (this.feeBump && !txInvocation.feeBump) {
      txInvocation.feeBump = this.feeBump
    }

    const sourceAccount = await this.horizonHandler.loadAccount(header.source)

    const envelope = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    })

    return { envelope, updatedTxInvocation: txInvocation }
  }

  /**
   *
   * @param {Transaction} envelope - The transaction envelope to submit.
   *
   * @description - Submits the given transaction envelope.
   *
   * @returns {Horizon.SubmitTransactionResponse} The transaction submission response.
   */
  public async submit(envelope: Transaction): Promise<HorizonNamespace.SubmitTransactionResponse> {
    try {
      // stellar-base vs stellar-sdk conversion
      const envelopeXdr = envelope.toXDR()
      const classicEnvelope = ClassicTxBuild.fromXDR(envelopeXdr, this.network.networkPassphrase) as ClassicTransaction

      const response = await this.horizonHandler.server.submitTransaction(classicEnvelope)
      return response as HorizonNamespace.SubmitTransactionResponse
    } catch (error) {
      // console.log("Couldn't Submit the transaction: ")
      // const resultObject = (error as any)?.response?.data?.extras?.result_codes
      // console.log(resultObject)
      throw new Error('Failed to submit transaction!')
    }
  }

  /**
   *
   * @param {Horizon.SubmitTransactionResponse} response - The response from the Horizon server.
   *
   * @returns {Horizon.SubmitTransactionResponse} The response from the Horizon server.
   *
   * @description - Post processes the transaction response from the Horizon server.
   * This method can be overridden to provide custom post processing.
   */
  public postProcessTransaction(
    response: HorizonNamespace.SubmitTransactionResponse
  ): HorizonNamespace.SubmitTransactionResponse {
    if (!response.successful) {
      // const restulObject = xdrNamespace.TransactionResult.fromXDR(response.result_xdr, 'base64')
      // const resultMetaObject = xdrNamespace.TransactionResultMeta.fromXDR(response.result_meta_xdr, 'base64')
      throw new Error('Transaction failed!')
    }

    return response
  }
}
