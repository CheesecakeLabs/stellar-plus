import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { SignatureRequirement } from 'stellar-plus/core/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type ClassicSignRequirementsPipelineInput = Transaction | FeeBumpTransaction

export type ClassicSignRequirementsPipelineOutput = SignatureRequirement[]

export enum ClassicSignRequirementsPipelineType {
  id = 'ClassicSignRequirementsPipeline',
}

export type ClassicSignRequirementsPipelinePlugin = BeltPluginType<
  ClassicSignRequirementsPipelineInput,
  ClassicSignRequirementsPipelineOutput,
  ClassicSignRequirementsPipelineType | GenericPlugin
>
