import { Horizon as HorizonNamespace, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

import { TransactionSubmitter as TransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/core/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon/index'
import { HorizonHandler } from 'stellar-plus/horizon/types'
import { Network } from 'stellar-plus/types'

import { DTSError } from './errors'

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
  public async submit(envelope: Transaction): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    try {
      // stellar-base vs stellar-sdk conversion
      // TODO: Review post lib update to stellar-sdk v11
      const envelopeXdr = envelope.toXDR()
      const classicEnvelope = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase) as Transaction

      return (await this.horizonHandler.server.submitTransaction(
        classicEnvelope
      )) as HorizonNamespace.HorizonApi.SubmitTransactionResponse
    } catch (error) {
      throw DTSError.failedToSubmitTransaction(error as Error, envelope)
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
    response: HorizonNamespace.HorizonApi.SubmitTransactionResponse
  ): HorizonNamespace.HorizonApi.SubmitTransactionResponse {
    if (!response.successful) {
      throw DTSError.transactionSubmittedFailed(response)
    }

    return response
  }
}
