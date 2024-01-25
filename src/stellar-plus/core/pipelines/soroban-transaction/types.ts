import { xdr } from '@stellar/stellar-sdk'

import {
  BuildTransactionPipelinePlugin,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import {
  ClassicSignRequirementsPipelinePlugin,
  ClassicSignRequirementsPipelineType,
} from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import {
  SignTransactionPipelinePlugin,
  SignTransactionPipelineType,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import {
  SimulateTransactionPipelinePlugin,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import {
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelinePlugin,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import {
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network, TransactionInvocation } from 'stellar-plus/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SorobanTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  networkConfig: Network
  options?: {
    innerPlugins?: SupportedInnerPlugins[]
  }
}

export type SorobanTransactionPipelineOutput = SorobanGetTransactionPipelineOutput

export type SupportedInnerPlugins =
  | BuildTransactionPipelinePlugin
  | SimulateTransactionPipelinePlugin
  | ClassicSignRequirementsPipelinePlugin
  | SignTransactionPipelinePlugin
  | SubmitTransactionPipelinePlugin
  | SorobanGetTransactionPipelinePlugin

export type SupportedInnerPluginsTypes =
  | BuildTransactionPipelineType
  | SimulateTransactionPipelineType
  | ClassicSignRequirementsPipelineType
  | SignTransactionPipelineType
  | SubmitTransactionPipelineType
  | SorobanGetTransactionPipelineType
  | GenericPlugin

export const listOfSupportedInnerPluginsTypes: SupportedInnerPluginsTypes[] = [
  'GenericPlugin' as GenericPlugin,
  'BuildTransactionPipeline' as BuildTransactionPipelineType,
  'SimulateTransactionPipeline' as SimulateTransactionPipelineType,
  'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType,
  'SignTransactionPipeline' as SignTransactionPipelineType,
  'SubmitTransactionPipeline' as SubmitTransactionPipelineType,
  'SorobanGetTransactionPipeline' as SorobanGetTransactionPipelineType,
]

export type SorobanTransactionPipelineType = 'SorobanTransactionPipeline'

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
