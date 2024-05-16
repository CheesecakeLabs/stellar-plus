import { xdr } from '@stellar/stellar-sdk'

import {
  BuildTransactionPipelineOutput,
  BuildTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import {
  ClassicSignRequirementsPipelineOutput,
  ClassicSignRequirementsPipelinePlugin,
} from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import {
  SignTransactionPipelineOutput,
  SignTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import {
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelinePlugin,
  SimulatedInvocationOutput,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { SorobanAuthPipelineOutput, SorobanAuthPipelinePlugin } from 'stellar-plus/core/pipelines/soroban-auth/types'
import {
  ContractInvocationOutput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import {
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { TransactionInvocation } from 'stellar-plus/types'
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
    includeHashOutput?: boolean
    verboseOutput?: boolean
  }
}

export type SorobanTransactionPipelineOutput =
  | SorobanTransactionPipelineOutputSimple
  | SorobanTransactionPipelineOutputVerbose

export type SorobanTransactionPipelineOutputSimple = SimulatedInvocationOutput | ContractInvocationOutput<unknown>

export type SorobanTransactionPipelineOutputVerbose = (VerboseSimulatedOutput | VerboseExecutedOutput | undefined) & {
  sorobanTransactionOutput: SorobanTransactionPipelineOutputSimple
  hash?: string
}
export type VerboseSimulatedOutput = {
  buildTransactionPipelineOutput: BuildTransactionPipelineOutput
  simulateTransactionPipelineOutput: SimulateTransactionPipelineOutput
}

export type VerboseExecutedOutput = VerboseSimulatedOutput & {
  sorobanAuthPipelineOutput: SorobanAuthPipelineOutput
  classicSignRequirementsPipelineOutput: ClassicSignRequirementsPipelineOutput
  signTransactionPipelineOutput: SignTransactionPipelineOutput
  submitTransactionPipelineOutput: SubmitTransactionPipelineOutput
  sorobanGetTransactionPipelineOutput: SorobanGetTransactionPipelineOutput
}

export type SupportedInnerPlugins =
  | BuildTransactionPipelinePlugin
  | SimulateTransactionPipelinePlugin
  | SorobanAuthPipelinePlugin
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
  customRpcHandler?: RpcHandler
}
