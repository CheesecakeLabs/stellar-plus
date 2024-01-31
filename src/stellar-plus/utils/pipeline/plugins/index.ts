import { genericPlugins } from './generic'
import { filterPluginsByName, filterPluginsByType, filterPluginsByTypes } from './helpers'
import { simulateTransactionPlugins } from './simulate-transaction'
import { sorobanGetTransactionPlugins } from './soroban-get-transaction'
import { sorobanTransactionPlugins } from './soroban-transaction'
import { submitTransactionPlugins } from './submit-transaction'

export const plugins = {
  generic: genericPlugins,
  simulateTransaction: simulateTransactionPlugins,
  sorobanGetTransaction: sorobanGetTransactionPlugins,
  sorobanTransaction: sorobanTransactionPlugins,
  submitTransaction: submitTransactionPlugins,
  filterPluginsByType: filterPluginsByType,
  filterPluginsByTypes: filterPluginsByTypes,
  filterPluginsByName: filterPluginsByName,
}
