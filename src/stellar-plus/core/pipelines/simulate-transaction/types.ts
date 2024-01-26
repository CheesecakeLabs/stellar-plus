import { SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { TransactionResources } from 'stellar-plus/core/contract-engine/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SimulateTransactionPipelineInput = {
  transaction: Transaction
  rpcHandler: RpcHandler
}

export type SimulateTransactionPipelineOutput = {
  response: SorobanRpc.Api.SimulateTransactionSuccessResponse
  output?: SimulatedInvocationOutput & ResourcesOutput
}

// export type SimulateTransactionPipelineType = 'SimulateTransactionPipeline'
export enum SimulateTransactionPipelineType {
  id = 'SimulateTransactionPipeline',
}

export type SimulateTransactionPipelinePlugin = BeltPluginType<
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType | GenericPlugin
>

export type SimulatedInvocationOutput = {
  value?: unknown
}

export type ResourcesOutput = {
  resources?: TransactionResources
}
