import { TransactionBuilder } from 'stellar-base'

import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { FeeBumpPipelineInput, FeeBumpPipelineOutput, FeeBumpPipelinePlugin, FeeBumpPipelineType } from './types'

export class FeeBumpPipeline extends ConveyorBelt<FeeBumpPipelineInput, FeeBumpPipelineOutput, FeeBumpPipelineType> {
  constructor(plugins?: FeeBumpPipelinePlugin[]) {
    super({
      type: 'FeeBumpPipeline',
      plugins: plugins || [],
    })
  }

  protected async process(item: FeeBumpPipelineInput, _itemId: string): Promise<FeeBumpPipelineOutput> {
    const { innerTransaction, feeBumpHeader }: FeeBumpPipelineInput = item

    const networkPassphrase = innerTransaction.networkPassphrase

    try {
      const feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
        feeBumpHeader.header.source,
        feeBumpHeader.header.fee,
        innerTransaction,
        networkPassphrase
      )

      return feeBumpTransaction
    } catch (error) {
      throw new Error(`Error building fee bump transaction: ${(error as Error).message}`)
    }
  }
}
