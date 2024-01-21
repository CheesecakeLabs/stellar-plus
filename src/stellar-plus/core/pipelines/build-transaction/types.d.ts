import { xdr } from '@stellar/stellar-sdk'

import { HorizonHandler } from 'stellar-plus'
import { EnvelopeHeader, Transaction } from 'stellar-plus/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type BuildTransactionPipelineInput = {
  header: EnvelopeHeader
  horizonHandler: HorizonHandler
  operations: xdr.Operation[]
  networkPassphrase: string
}

export type BuildTransactionPipelineOutput = Transaction

export type BuildTransactionPipelineType = 'BuildTransactionPipeline'

export type BuildTransactionPipeline = ConveyorBelt<
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelineType
>

export type BuildTransactionPipelinePlugin = BeltPluginType<
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelineType
>
