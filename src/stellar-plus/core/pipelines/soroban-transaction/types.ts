import { xdr } from '@stellar/stellar-sdk'

import { BuildTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/build-transaction/types'
import { ClassicSignRequirementsPipelinePlugin } from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import { SignTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/sign-transaction/types'
import { SimulateTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/simulate-transaction/types'
import {
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { SubmitTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/submit-transaction/types'
import { Network, TransactionInvocation } from 'stellar-plus/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SorobanTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  networkConfig: Network
  options?: {
    innerPlugins?: SorobanTransactionPipelineSupportedInnerPlugins[]
  }
}

export type SorobanTransactionPipelineOutput = {
  result: SorobanGetTransactionPipelineOutput
}

export type SorobanTransactionPipelineSupportedInnerPlugins =
  | BuildTransactionPipelinePlugin
  | SimulateTransactionPipelinePlugin
  | ClassicSignRequirementsPipelinePlugin
  | SignTransactionPipelinePlugin
  | SubmitTransactionPipelinePlugin
  | SorobanGetTransactionPipelinePlugin

export type SorobanTransactionPipelineType = 'SorobanTransactionPipeline'

export type SorobanTransactionPipeline = ConveyorBelt<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType
>

export type SorobanTransactionPipelinePlugin = BeltPluginType<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType | GenericPlugin
>
