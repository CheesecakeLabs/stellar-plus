import { TransactionBuilder } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import {
  SignTransactionPipelineInput,
  SignTransactionPipelineOutput,
  SignTransactionPipelinePlugin,
  SignTransactionPipelineType,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { PSIGError } from './errors'

export class SignTransactionPipeline extends ConveyorBelt<
  SignTransactionPipelineInput,
  SignTransactionPipelineOutput,
  SignTransactionPipelineType
> {
  constructor(plugins?: SignTransactionPipelinePlugin[]) {
    super({
      type: SignTransactionPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(item: SignTransactionPipelineInput, itemId: string): Promise<SignTransactionPipelineOutput> {
    const { transaction, signatureRequirements, signers }: SignTransactionPipelineInput = item

    if (signatureRequirements.length === 0) {
      throw PSIGError.noRequirementsProvided(extractConveyorBeltErrorMeta(item, this.getMeta(itemId)), transaction)
    }

    if (signers.length === 0) {
      throw PSIGError.noSignersProvided(extractConveyorBeltErrorMeta(item, this.getMeta(itemId)), transaction)
    }

    const passphrase = transaction.networkPassphrase
    let signedTransaction = transaction

    for (const requirement of signatureRequirements) {
      const signer = signers.find((s) => s.getPublicKey() === requirement.publicKey) as AccountHandler

      if (!signer)
        throw PSIGError.signerNotFound(
          extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
          transaction,
          requirement.publicKey,
          signers.map((s) => s.getPublicKey())
        )

      if (!signer.signatureSchema) {
        try {
          signedTransaction = TransactionBuilder.fromXDR(
            await signer.sign(signedTransaction),
            passphrase
          ) as typeof transaction
        } catch (error) {
          throw PSIGError.couldntSignTransaction(
            error as Error,
            extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
            transaction,
            signer.getPublicKey()
          )
        }
      } else {
        throw new Error('Multisignature support not implemented yet')
      }
    }

    return signedTransaction
  }
}
