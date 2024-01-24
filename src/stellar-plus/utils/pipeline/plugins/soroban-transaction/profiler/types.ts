import { TransactionResources } from 'stellar-plus/core/contract-engine/types'
import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type LogEntry = {
  methodName: string
  status: 'success' | 'error' | 'running'
  resources: TransactionResources
  feeCharged: number
  elapsedTime?: string
}

// to be merged with all accepted types
export type InnerPlugins = BeltPluginType<
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType
>
