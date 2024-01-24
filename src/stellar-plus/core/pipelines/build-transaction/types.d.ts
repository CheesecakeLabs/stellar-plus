import { xdr } from '@stellar/stellar-sdk'

import { HorizonHandler } from 'stellar-plus'
import { EnvelopeHeader, Transaction } from 'stellar-plus/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type BuildTransactionPipelineInput = {
  header: EnvelopeHeader
  horizonHandler: HorizonHandler
  operations: xdr.Operation[]
  networkPassphrase: string
}

export type BuildTransactionPipelineOutput = Transaction

export type BuildTransactionPipelineType = 'BuildTransactionPipeline'

export type BuildTransactionPipelinePlugin = BeltPluginType<
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelineType | GenericPlugin
>
