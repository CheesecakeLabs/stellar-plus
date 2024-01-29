import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { HorizonHandler } from 'stellar-plus'
import {
  SubmitTransactionPipelineInput,
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

export class SubmitTransactionPipeline extends ConveyorBelt<
  SubmitTransactionPipelineInput,
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelineType
> {
  constructor(plugins?: SubmitTransactionPipelinePlugin[]) {
    super({
      type: SubmitTransactionPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(
    item: SubmitTransactionPipelineInput,
    _itemId: string
  ): Promise<SubmitTransactionPipelineOutput> {
    const { transaction, networkHandler }: SubmitTransactionPipelineInput = item

    if (networkHandler instanceof HorizonHandler) {
      return await this.submitTransactionThroughHorizon(transaction, networkHandler)
    }

    if (networkHandler.type && networkHandler.type === 'RpcHandler') {
      return await this.submitTransactionThroughRpc(transaction, networkHandler)
    }

    throw new Error('Invalid network handler')
  }

  private async submitTransactionThroughHorizon(
    transaction: Transaction | FeeBumpTransaction,
    horizonHandler: HorizonHandler
  ): Promise<SubmitTransactionPipelineOutput> {
    try {
      const response = (await horizonHandler.server.submitTransaction(transaction, {
        skipMemoRequiredCheck: true, // Not skipping memo required check causes an error when submitting fee bump transactions
      })) as HorizonApi.SubmitTransactionResponse
      return { response }
    } catch (error) {
      throw new Error(`Error submitting transaction through horizon: ${(error as Error).message}`)
    }
  }

  private async submitTransactionThroughRpc(
    transaction: Transaction | FeeBumpTransaction,
    rpcHandler: RpcHandler
  ): Promise<SubmitTransactionPipelineOutput> {
    try {
      const response = await rpcHandler.submitTransaction(transaction)

      return { response }
    } catch (error) {
      throw new Error(`Error submitting transaction through rpc: ${(error as Error).message}`)
    }
  }
}
