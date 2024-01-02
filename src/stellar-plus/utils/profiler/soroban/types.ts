import { TransactionResources } from 'stellar-plus/core/contract-engine/types'

export type LogEntry = {
  methodName: string
  costs: TransactionResources
  elapsedTime?: number
}

export type GetLogOptions = {
  clear?: boolean // clears the log afterwards
  filter?: Filters // Define which resources to filter
  aggregate?: AggregateType // Define which resources to aggregate
  formatOutput?: 'csv' | 'text-table' // Format the output
}

export type Filters = ResourcesList<FilterResource> & {
  methods?: string[]
}

export type FilterResource = {
  include?: boolean //Should the resource be included or excluded, defaults to true if not defined
  min?: number //Min value for the entry to be included, if not defined, considers all values
  max?: number //Max value for the entry to be included, if not defined, considers all values
}

export type ResourcesList<T> = {
  cpuInstructions?: T
  ram?: T
  minResourceFee?: T
  ledgerReadBytes?: T
  ledgerWriteBytes?: T
  ledgerEntryReads?: T
  ledgerEntryWrites?: T
  eventSize?: T
  returnValueSize?: T
  transactionSize?: T
}

export type AggregateType = ResourcesList<AggregationMethod> & {
  all?: AggregationMethod
  elapsedTime?: AggregationMethod
}

export type AggregationMethod = {
  method: 'sum' | 'average' | 'standardDeviation'
}
