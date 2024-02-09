import { SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SorobanAuthPipelineInput = {
  transaction: Transaction
  simulation: SorobanRpc.Api.SimulateTransactionSuccessResponse | SorobanRpc.Api.SimulateTransactionRestoreResponse
  signers: AccountHandler[]
  rpcHandler: RpcHandler
}

export type SorobanAuthPipelineOutput = Transaction

// export type SorobanAuthPipelineType = 'SorobanAuthPipeline'
export enum SorobanAuthPipelineType {
  id = 'SorobanAuthPipeline',
}

export type SorobanAuthPipelinePlugin = BeltPluginType<
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelineType | GenericPlugin
>
