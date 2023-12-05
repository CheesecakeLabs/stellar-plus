import * as SorobanClient from 'soroban-client'
import { Transaction as ClassicTransaction, TransactionBuilder, xdr as xdrNamespace } from 'stellar-base'
import { Horizon as HorizonNamespace } from 'stellar-sdk'

import { AccountHandler } from '@account/account-handler/types'
import { DefaultTransactionSubmitter } from '@core/transaction-submitter/classic/default'
import { TransactionSubmitter } from '@core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from '@core/types'
import { HorizonHandlerClient } from '@horizon/index'
import { HorizonHandler } from '@horizon/types'
import { FeeBumpTransaction, Network, Transaction, TransactionXdr } from '@stellar-plus/types'

export class TransactionProcessor {
  protected horizonHandler: HorizonHandler
  protected network: Network
  protected transactionSubmitter: TransactionSubmitter

  constructor(network: Network, transactionSubmitter?: TransactionSubmitter) {
    this.network = network
    this.horizonHandler = new HorizonHandlerClient(network)
    this.transactionSubmitter = transactionSubmitter || new DefaultTransactionSubmitter(network)
  }

  protected async signEnvelope(envelope: Transaction, signers: AccountHandler[]): Promise<TransactionXdr> {
    let signedXDR = envelope.toXDR()
    for (const signer of signers) {
      signedXDR = await signer.sign(SorobanClient.TransactionBuilder.fromXDR(signedXDR, this.network.networkPassphrase))
    }
    return signedXDR
  }

  protected async wrapFeeBump(envelopeXdr: TransactionXdr, feeBump: FeeBumpHeader): Promise<FeeBumpTransaction> {
    const tx = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase) as ClassicTransaction

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeBump.header.source,
      feeBump.header.fee,
      tx,
      this.network.networkPassphrase
    )

    const signedFeeBumpXDR = await this.signEnvelope(feeBumpTx, feeBump.signers)

    return TransactionBuilder.fromXDR(signedFeeBumpXDR, this.network.networkPassphrase) as FeeBumpTransaction
  }

  public async processTransaction(
    envelope: Transaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<HorizonNamespace.SubmitTransactionResponse> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers)
    const finalEnvelope = feeBump
      ? await this.wrapFeeBump(signedInnerTransaction, feeBump)
      : TransactionBuilder.fromXDR(signedInnerTransaction, this.network.networkPassphrase)
    const horizonResponse = (await this.transactionSubmitter.submit(
      finalEnvelope
    )) as HorizonNamespace.SubmitTransactionResponse
    const processedTransaction = this.transactionSubmitter.postProcessTransaction(
      horizonResponse
    ) as HorizonNamespace.SubmitTransactionResponse
    return processedTransaction
  }

  protected verifySigners(publicKeys: string[], signers: AccountHandler[]): void {
    publicKeys.forEach((publicKey) => {
      if (!signers.find((signer) => signer.publicKey === publicKey)) {
        throw new Error(`Missing signer for public key: ${publicKey}`)
      }
    })
  }

  public async buildCustomTransaction(
    operations: xdrNamespace.Operation[],
    txInvocation: TransactionInvocation
  ): Promise<{
    builtTx: ClassicTransaction
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
