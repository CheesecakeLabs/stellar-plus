import { SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SimulateTransactionPipelineInput = {
  transaction: Transaction
  rpcHandler: RpcHandler
}

export type SimulateTransactionPipelineOutput = SorobanRpc.Api.SimulateTransactionSuccessResponse

export type SimulateTransactionPipelineType = 'SimulateTransactionPipeline'

export type SimulateTransactionPipelinePlugin = BeltPluginType<
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType | GenericPlugin
>
