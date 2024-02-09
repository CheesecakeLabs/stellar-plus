import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SorobanAuthPipelineInput = {
  transaction: Transaction | FeeBumpTransaction
  signers: AccountHandler[]
}

export type SorobanAuthPipelineOutput = Transaction | FeeBumpTransaction

// export type SorobanAuthPipelineType = 'SorobanAuthPipeline'
export enum SorobanAuthPipelineType {
  id = 'SorobanAuthPipeline',
}

export type SorobanAuthPipelinePlugin = BeltPluginType<
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelineType | GenericPlugin
>
