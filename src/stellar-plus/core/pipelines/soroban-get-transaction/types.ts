import { FeeBumpTransaction, SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SorobanGetTransactionPipelineInput = {
  sorobanSubmission: SorobanRpc.Api.SendTransactionResponse
  rpcHandler: RpcHandler
  transactionEnvelope?: Transaction | FeeBumpTransaction
}

export type SorobanGetTransactionPipelineOutput = {
  response: SorobanRpc.Api.GetSuccessfulTransactionResponse
  output?: number
}

export type SorobanGetTransactionPipelineType = 'SorobanGetTransactionPipeline'

export type SorobanGetTransactionPipelinePlugin = BeltPluginType<
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType | GenericPlugin
>

export type SorobanGetTransactionOptions = {
  defaultSecondsToWait: number // Defines the default number of seconds to wait before checking the status of a transaction
  useEnvelopeTimeout: boolean // If true, the pipeline will use the timeout defined in the transaction envelope whenever available
}
