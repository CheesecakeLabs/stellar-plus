import { AutoRestorePlugin } from './auto-restore'
import { ExtractAuthEntriesFromSimulationPlugin } from './extract-auth-entries-output'
import { ExtractTransactionResourcesPlugin } from './extract-transaction-resources'
import { ExtractInvocationOutputPlugin } from '../soroban-get-transaction/extract-invocation-output'

export const simulateTransactionPlugins = {
  autoRestore: AutoRestorePlugin,
  extractInvocationOutput: ExtractInvocationOutputPlugin,
  extractTransactionResources: ExtractTransactionResourcesPlugin,
  extractAuthEntries: ExtractAuthEntriesFromSimulationPlugin,
}
