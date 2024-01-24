import { FeeBumpTransaction, Transaction, TransactionBuilder } from 'stellar-base'

import { AccountHandler } from 'stellar-plus/account'
import {
  SignTransactionPipelineInput,
  SignTransactionPipelineOutput,
  SignTransactionPipelinePlugin,
  SignTransactionPipelineType,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import { SignatureRequirement } from 'stellar-plus/core/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

export class SignTransactionPipeline extends ConveyorBelt<
  SignTransactionPipelineInput,
  SignTransactionPipelineOutput,
  SignTransactionPipelineType
> {
  constructor(plugins?: SignTransactionPipelinePlugin[]) {
    super({
      type: 'SignTransactionPipeline',
      plugins: plugins || [],
    })
  }

  protected async process(item: SignTransactionPipelineInput, _itemId: string): Promise<SignTransactionPipelineOutput> {
    const { transaction, signatureRequirements, signers }: SignTransactionPipelineInput = item

    const signedTransaction = await this.signTransaction(transaction, signatureRequirements, signers)

    return signedTransaction
  }

  private async signTransaction(
    transaction: Transaction | FeeBumpTransaction,
    requirements: SignatureRequirement[],
    signers: AccountHandler[]
  ): Promise<Transaction | FeeBumpTransaction> {
    const passphrase = transaction.networkPassphrase
    let signedTransaction = transaction

    console.log('REQ', requirements)
    for (const requirement of requirements) {
      const signer = signers.find((s) => s.getPublicKey() === requirement.publicKey) as AccountHandler
      if (!signer) throw new Error(`Signer not found: ${requirement.publicKey}`)

      if (!signer.signatureSchema) {
        signedTransaction = TransactionBuilder.fromXDR(
          await signer.sign(signedTransaction),
          passphrase
        ) as typeof transaction
      } else {
        throw new Error('Multisignature support not implemented yet')
      }
    }
    return signedTransaction
  }
}
