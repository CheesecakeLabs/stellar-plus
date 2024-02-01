import { AutoRestorePlugin } from './auto-restore'
import { ExtractTransactionResourcesPlugin } from './extract-transaction-resources'
import { ExtractInvocationOutputPlugin } from '../soroban-get-transaction/extract-invocation-output'

export const simulateTransactionPlugins = {
  autoRestore: AutoRestorePlugin,
  extractInvocationOutput: ExtractInvocationOutputPlugin,
  extractTransactionResources: ExtractTransactionResourcesPlugin,
}
