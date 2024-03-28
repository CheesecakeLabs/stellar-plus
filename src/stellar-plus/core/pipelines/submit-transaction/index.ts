import { FeeBumpTransaction, SorobanRpc, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import {
  SubmitTransactionPipelineInput,
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { PSUError } from './errors'
import { HorizonHandlerClient } from 'stellar-plus/horizon'

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
    itemId: string
  ): Promise<SubmitTransactionPipelineOutput> {
    const { transaction, networkHandler }: SubmitTransactionPipelineInput = item

    //
    // ===================
    // Horizon Submission
    // ===================
    //
    if (networkHandler instanceof HorizonHandlerClient) {
      let response: HorizonApi.SubmitTransactionResponse
      try {
        response = await this.submitTransactionThroughHorizon(transaction, networkHandler)
      } catch (error) {
        throw PSUError.horizonSubmissionFailed(
          error as Error,
          extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
          transaction
        )
      }

      if (!response.successful) {
        throw PSUError.transactionSubmittedThroughHorizonFailed(
          response,
          extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
          transaction
        )
      }

      return { response } as SubmitTransactionPipelineOutput
    }

    //
    // ===================
    // RPC Submission
    // ===================
    //
    if (networkHandler.type && networkHandler.type === 'RpcHandler') {
      let response: SorobanRpc.Api.SendTransactionResponse

      try {
        response = await this.submitTransactionThroughRpc(transaction, networkHandler)
      } catch (error) {
        throw PSUError.rpcSubmissionFailed(
          error as Error,
          extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
          transaction
        )
      }

      return { response } as SubmitTransactionPipelineOutput
    }

    throw PSUError.invalidNetworkHandler(extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
  }

  private async submitTransactionThroughHorizon(
    transaction: Transaction | FeeBumpTransaction,
    horizonHandler: HorizonHandlerClient
  ): Promise<HorizonApi.SubmitTransactionResponse> {
    const response = (await horizonHandler.server.submitTransaction(transaction, {
      skipMemoRequiredCheck: true, // Not skipping memo required check causes an error when submitting fee bump transactions
    })) as HorizonApi.SubmitTransactionResponse
    return response
  }

  private async submitTransactionThroughRpc(
    transaction: Transaction | FeeBumpTransaction,
    rpcHandler: RpcHandler
  ): Promise<SorobanRpc.Api.SendTransactionResponse> {
    return await rpcHandler.submitTransaction(transaction)
  }
}
