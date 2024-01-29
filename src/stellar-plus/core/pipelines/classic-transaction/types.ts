import { xdr } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { BuildTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/build-transaction/types'
import { ClassicSignRequirementsPipelinePlugin } from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import { SignTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/sign-transaction/types'
import { SubmitTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/submit-transaction/types'
import { Network, TransactionInvocation } from 'stellar-plus/types'
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
  }
}

export type ClassicTransactionPipelineOutput = { response: HorizonApi.SubmitTransactionResponse }

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
  networkConfig: Network
}
