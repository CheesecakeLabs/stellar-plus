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
  readonly type: SubmitTransactionPipelineType = 'SubmitTransactionPipeline'
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

    if (transaction instanceof FeeBumpTransaction) {
      throw new Error('Transaction is already a FeeBump, FeeBumpWrapperPlugin should not be used')
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
