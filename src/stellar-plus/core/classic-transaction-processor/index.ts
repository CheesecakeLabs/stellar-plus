import {
  FeeBumpTransaction,
  Horizon as HorizonNamespace,
  Transaction,
  TransactionBuilder,
  xdr as xdrNamespace,
} from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { DefaultTransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/default'
import { TransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/core/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon/index'
import { HorizonHandler } from 'stellar-plus/horizon/types'
import { Network, TransactionXdr } from 'stellar-plus/types'

export class TransactionProcessor {
  protected horizonHandler: HorizonHandler
  protected network: Network
  protected transactionSubmitter: TransactionSubmitter

  /**
   *
   * @param {Network} network
   * @param {TransactionSubmitter=} transactionSubmitter
   */
  constructor(network: Network, transactionSubmitter?: TransactionSubmitter) {
    this.network = network
    this.horizonHandler = new HorizonHandlerClient(network)
    this.transactionSubmitter = transactionSubmitter || new DefaultTransactionSubmitter(network)
  }

  /**
   *
   * @param {Transaction} envelope
   * @param {AccountHandler[]} signers
   *
   * @description - Signs the given transaction envelope with the provided signers.
   *
   * @returns {TransactionXdr} The signed transaction in xdr format.
   */
  protected async signEnvelope(
    envelope: Transaction | FeeBumpTransaction,
    signers: AccountHandler[]
  ): Promise<TransactionXdr> {
    let signedXDR = envelope.toXDR()
    for (const signer of signers) {
      signedXDR = await signer.sign(TransactionBuilder.fromXDR(signedXDR, this.network.networkPassphrase))
    }
    return signedXDR
  }

  /**
   *
   * @param {TransactionXdr} envelopeXdr
   * @param {FeeBumpHeader} feeBump
   *
   * @description - Wraps the given transaction envelope with the provided fee bump header.
   *
   * @returns {FeeBumpTransaction} The fee bump transaction.
   */
  protected async wrapFeeBump(envelopeXdr: TransactionXdr, feeBump: FeeBumpHeader): Promise<FeeBumpTransaction> {
    const innerTx = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase)

    if (innerTx instanceof FeeBumpTransaction) {
      throw new Error('Cannot wrap fee bump transaction with fee bump transaction')
    }

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeBump.header.source,
      feeBump.header.fee,
      innerTx,
      this.network.networkPassphrase
    )

    const signedFeeBumpXDR = await this.signEnvelope(feeBumpTx, feeBump.signers)

    return TransactionBuilder.fromXDR(signedFeeBumpXDR, this.network.networkPassphrase) as FeeBumpTransaction
  }

  /**
   *
   * @param {Transaction} envelope
   * @param {AccountHandler[]} signers
   * @param {FeeBumpHeader=} feeBump
   *
   * @description - Processes the given transaction envelope with the provided signers and fee bump header, submitting to the network.
   *
   * @returns {Promise<HorizonNamespace.SubmitTransactionResponse>} The horizon response from the transaction submission.
   */
  public async processTransaction(
    envelope: Transaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers)
    const finalEnvelope = feeBump
      ? await this.wrapFeeBump(signedInnerTransaction, feeBump)
      : TransactionBuilder.fromXDR(signedInnerTransaction, this.network.networkPassphrase)
    const horizonResponse = (await this.transactionSubmitter.submit(
      finalEnvelope
    )) as HorizonNamespace.HorizonApi.SubmitTransactionResponse
    const processedTransaction = this.transactionSubmitter.postProcessTransaction(
      horizonResponse
    ) as HorizonNamespace.HorizonApi.SubmitTransactionResponse
    return processedTransaction
  }

  /**
   *
   * @param {string[]} publicKeys
   * @param {AccountHandler[]} signers
   *
   * @description - Verifies that all public keys are present in the signers array. Throws an error if any are missing.
   *
   * @returns {void}
   */
  protected verifySigners(publicKeys: string[], signers: AccountHandler[]): void {
    publicKeys.forEach((publicKey) => {
      if (!signers.find((signer) => signer.publicKey === publicKey)) {
        throw new Error(`Missing signer for public key: ${publicKey}`)
      }
    })
  }

  /**
   *
   * @param {xdrNamespace.Operation[]} operations Array of operations to add to the transaction.
   * @param {TransactionInvocation} txInvocation The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Builds a custom transaction with the provided operations and transaction invocation.
   *
   * @returns {Promise<{builtTx: ClassicTransaction, updatedTxInvocation: TransactionInvocation}>} The built transaction and updated transaction invocation.
   */
  public async buildCustomTransaction(
    operations: xdrNamespace.Operation[],
    txInvocation: TransactionInvocation
  ): Promise<{
    builtTx: Transaction
    updatedTxInvocation: TransactionInvocation
  }> {
    const { envelope, updatedTxInvocation } = await this.transactionSubmitter.createEnvelope(txInvocation)

    const { header } = updatedTxInvocation

    let tx: TransactionBuilder = envelope

    for (const operation of operations) {
      tx = envelope.addOperation(operation)
    }

    const builtTx = tx.setTimeout(header.timeout).build()

    return { builtTx, updatedTxInvocation }
  }
}
