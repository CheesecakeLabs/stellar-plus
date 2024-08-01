import { Horizon, xdr } from '@stellar/stellar-sdk'

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
  SubmitTransactionPipelineOutput,
  SubmitTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { TransactionInvocation } from 'stellar-plus/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export enum ClassicTransactionPipelineType {
  id = 'ClassicTransactionPipeline',
}

export type ClassicTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  options?: {
    executionPlugins?: SupportedInnerPlugins[]
    includeHashOutput?: boolean
    verboseOutput?: boolean
  }
}

export type ClassicTransactionPipelineOutput =
  | ClassicTransactionPipelineOutputSimple
  | ClassicTransactionPipelineOutputVerbose
export type ClassicTransactionPipelineOutputSimple = { response: Horizon.HorizonApi.SubmitTransactionResponse }
export type ClassicTransactionPipelineOutputVerbose = (VerboseOutput | undefined) & {
  classicTransactionOutput: ClassicTransactionPipelineOutputSimple
  hash?: string
}

export type VerboseOutput = {
  buildTransactionPipelineOutput: BuildTransactionPipelineOutput
  classicSignRequirementsPipelineOutput: ClassicSignRequirementsPipelineOutput
  signTransactionPipelineOutput: SignTransactionPipelineOutput
  submitTransactionPipelineOutput: SubmitTransactionPipelineOutput
}

export type SupportedInnerPlugins =
  | BuildTransactionPipelinePlugin
  | ClassicSignRequirementsPipelinePlugin
  | SignTransactionPipelinePlugin
  | SubmitTransactionPipelinePlugin

export type ClassicTransactionPipeline = ConveyorBelt<
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineType
>

export type ClassicTransactionPipelinePlugin = ClassicTransactionPipelineMainPlugin | SupportedInnerPlugins

export type ClassicTransactionPipelineMainPlugin = BeltPluginType<
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineType | GenericPlugin
>

export type ClassicTransactionPipelineOptions = {
  plugins?: ClassicTransactionPipelinePlugin[]
}
