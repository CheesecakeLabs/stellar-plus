import { TransactionResources } from 'stellar-plus/core/contract-engine/types'
import { SimulateTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { SorobanGetTransactionPipelinePlugin } from 'stellar-plus/core/pipelines/soroban-get-transaction/types'

export type LogEntry = {
  methodName: string
  status: 'success' | 'error' | 'running'
  resources: TransactionResources
  feeCharged: number
  elapsedTime?: string
}

// to be merged with all accepted types
export type InnerPlugins = SimulateTransactionPipelinePlugin | SorobanGetTransactionPipelinePlugin
