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

// export type SorobanTransactionPipelineInput = SorobanInvocationInputSimulateOnly | SorobanInvocationInputExecute

// export type SorobanInvocationInput = SorobanInvocationInputSimulateOnly | SorobanInvocationInputExecute

export type SorobanTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  networkConfig: Network
  options?: {
    executionPlugins?: SupportedInnerPlugins[]
    simulateOnly?: boolean
  }
}

// Type for when we want to simulate the transaction only
// type SorobanInvocationInputSimulateOnly = SorobanInvocationInputBase & {
//   options?: SorobanInvocationInputBase['options'] & {
//     simulateOnly: true
//   }
// }

// // Type for when we want to simulate and execute the transaction
// type SorobanInvocationInputExecute = SorobanInvocationInputBase & {
//   options?: SorobanInvocationInputBase['options'] & {
//     simulateOnly?: false | undefined
//   }
// }

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

// export type SupportedPluginsTypes =
//   | BuildTransactionPipelineType
//   | SimulateTransactionPipelineType
//   | ClassicSignRequirementsPipelineType
//   | SignTransactionPipelineType
//   | SubmitTransactionPipelineType
//   | SorobanGetTransactionPipelineType
//   | GenericPlugin

// export const listOfSupportedPluginsTypes: SupportedPluginsTypes[] = [
//   BuildTransactionPipelineType.id,
//   SimulateTransactionPipelineType.id,
//   ClassicSignRequirementsPipelineType.id,
//   SignTransactionPipelineType.id,
//   SubmitTransactionPipelineType.id,
//   SorobanGetTransactionPipelineType.id,
//   GenericPlugin.id,
// ]

// export const listOfSupportedInnerPluginsTypes: SupportedInnerPluginsTypes[] = [
//   'GenericPlugin' as GenericPlugin,
//   'BuildTransactionPipeline' as BuildTransactionPipelineType,
//   'SimulateTransactionPipeline' as SimulateTransactionPipelineType,
//   'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType,
//   'SignTransactionPipeline' as SignTransactionPipelineType,
//   'SubmitTransactionPipeline' as SubmitTransactionPipelineType,
//   'SorobanGetTransactionPipeline' as SorobanGetTransactionPipelineType,
// ]

// export type SorobanTransactionPipelineType = 'SorobanTransactionPipeline'

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
