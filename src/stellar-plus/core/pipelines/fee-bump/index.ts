import { FeeBumpTransaction, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

import {
  FeeBumpPipelineInput,
  FeeBumpPipelineOutput,
  FeeBumpPipelinePlugin,
  FeeBumpPipelineType,
} from 'stellar-plus/core/pipelines/fee-bump/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { PFBError } from './errors'

export class FeeBumpPipeline extends ConveyorBelt<FeeBumpPipelineInput, FeeBumpPipelineOutput, FeeBumpPipelineType> {
  constructor(plugins?: FeeBumpPipelinePlugin[]) {
    super({
      type: FeeBumpPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(item: FeeBumpPipelineInput, itemId: string): Promise<FeeBumpPipelineOutput> {
    const { innerTransaction, feeBumpHeader }: FeeBumpPipelineInput = item

    const networkPassphrase = innerTransaction.networkPassphrase

    try {
      // The conversion to and from XDR seems unnecessary, but it's the only way to
      // get the fee bump transaction to be properly signed.
      // Not fully sure if a bug in the SDK or the way we build the transaction yet
      // Needs further investigation.
      const feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
        feeBumpHeader.header.source,
        feeBumpHeader.header.fee,
        TransactionBuilder.fromXDR(innerTransaction.toXDR(), networkPassphrase) as Transaction,
        networkPassphrase
      ) as FeeBumpTransaction

      return feeBumpTransaction
    } catch (error) {
      throw PFBError.couldntWrapFeeBump(
        error as Error,
        extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
        innerTransaction
      )
    }
  }
}
