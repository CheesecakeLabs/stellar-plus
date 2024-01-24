import { SorobanRpc, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'
import { FeeBumpTransaction } from 'stellar-base'

import { HorizonHandler } from 'stellar-plus'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SubmitTransactionPipelineInput = {
  transaction: Transaction | FeeBumpTransaction
  networkHandler: RpcHandler | HorizonHandler
}

export type SubmitTransactionPipelineOutput = {
  response: HorizonApi.SubmitTransactionResponse | SorobanRpc.Api.SendTransactionResponse
}

export type SubmitTransactionPipelineType = 'SubmitTransactionPipeline'

export type SubmitTransactionPipelinePlugin = BeltPluginType<
  SubmitTransactionPipelineInput,
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelineType | GenericPlugin
>
