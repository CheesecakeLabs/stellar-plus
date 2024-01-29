import { xdr } from '@stellar/stellar-sdk'

import { BuildTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/build-transaction/types'
import { ClassicSignRequirementsPipelinePlugin } from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import { SignTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/sign-transaction/types'
import {
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import {
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { SubmitTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/submit-transaction/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network, TransactionInvocation } from 'stellar-plus/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export enum SorobanTransactionPipelineType {
  id = 'SorobanTransactionPipeline',
}

export type SorobanTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  options?: {
    executionPlugins?: SupportedInnerPlugins[]
    simulateOnly?: boolean
  }
}

export type TransactionSimulationOutput = SimulateTransactionPipelineOutput
export type TransactionExecutionOutput = SorobanGetTransactionPipelineOutput
export type SorobanTransactionPipelineOutput = TransactionSimulationOutput | TransactionExecutionOutput

export type SupportedInnerPlugins =
  | BuildTransactionPipelinePlugin
  | SimulateTransactionPipelinePlugin
  | ClassicSignRequirementsPipelinePlugin
  | SignTransactionPipelinePlugin
  | SubmitTransactionPipelinePlugin
  | SorobanGetTransactionPipelinePlugin

export type SorobanTransactionPipeline = ConveyorBelt<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType
>

export type SorobanTransactionPipelinePlugin = SorobanTransactionPipelineMainPlugin | SupportedInnerPlugins

export type SorobanTransactionPipelineMainPlugin = BeltPluginType<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType | GenericPlugin
>

export type SorobanTransactionPipelineOptions = {
  plugins?: SorobanTransactionPipelinePlugin[]
  networkConfig: Network
  customRpcHandler?: RpcHandler
}
