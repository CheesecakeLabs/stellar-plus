import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { FeeBumpHeader } from 'stellar-plus/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type FeeBumpPipelineInput = {
  innerTransaction: Transaction
  feeBumpHeader: FeeBumpHeader
}

export type FeeBumpPipelineOutput = FeeBumpTransaction

export enum FeeBumpPipelineType {
  id = 'FeeBumpPipeline',
}

export type FeeBumpPipelinePlugin = BeltPluginType<
  FeeBumpPipelineInput,
  FeeBumpPipelineOutput,
  FeeBumpPipelineType | GenericPlugin
>
