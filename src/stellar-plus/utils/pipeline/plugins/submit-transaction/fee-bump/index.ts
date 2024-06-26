import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { ClassicSignRequirementsPipeline } from 'stellar-plus/core/pipelines/classic-sign-requirements'
import { FeeBumpPipeline } from 'stellar-plus/core/pipelines/fee-bump'
import { SignTransactionPipeline } from 'stellar-plus/core/pipelines/sign-transaction'
import {
  SubmitTransactionPipelineInput,
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { FeeBumpHeader } from 'stellar-plus/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class FeeBumpWrapperPlugin
  implements
    BeltPluginType<SubmitTransactionPipelineInput, SubmitTransactionPipelineOutput, SubmitTransactionPipelineType>
{
  readonly type = SubmitTransactionPipelineType.id
  readonly name: string = 'FeeBumpWrapperPlugin'

  private feeBumpHeader: FeeBumpHeader

  constructor(feeBumpHeader: FeeBumpHeader) {
    this.feeBumpHeader = feeBumpHeader
  }

  public async preProcess(
    item: SubmitTransactionPipelineInput,
    meta: BeltMetadata
  ): Promise<SubmitTransactionPipelineInput> {
    const { itemId } = meta
    const { transaction }: SubmitTransactionPipelineInput = item

    if ((transaction as FeeBumpTransaction).innerTransaction) {
      throw new Error('Transaction is already a FeeBump, FeeBumpWrapperPlugin should not be used')
    }

    //
    //
    // No fee bump is applied if both conditions are met:
    //      - source is the same for the fee bump and the transaction
    //      - fee in the original transaction is equal or higher than the fee in the fee bump
    //
    // A Fee bump for the same source account is only effective if the fee is increased in the process.
    // A lower or equal fee will result in errors during processing.
    //
    if (
      (transaction as Transaction).source === this.feeBumpHeader.header.source &&
      (transaction as Transaction).fee >= this.feeBumpHeader.header.fee
    ) {
      return item
    }

    const feeBumpPipeline = new FeeBumpPipeline()
    const feeBumpEnvelope = await feeBumpPipeline.execute(
      {
        innerTransaction: transaction as Transaction,
        feeBumpHeader: this.feeBumpHeader,
      },
      itemId
    )

    const classicSignRequirementsPipeline = new ClassicSignRequirementsPipeline()
    const classicSignRequirements = await classicSignRequirementsPipeline.execute(feeBumpEnvelope, itemId)
    const signTransactionPipeline = new SignTransactionPipeline()
    const signedTransaction = await signTransactionPipeline.execute(
      {
        transaction: feeBumpEnvelope,
        signatureRequirements: classicSignRequirements,
        signers: this.feeBumpHeader.signers,
      },
      itemId
    )

    const updatedItem: SubmitTransactionPipelineInput = {
      ...item,
      transaction: signedTransaction,
    }
    return updatedItem
  }
}
