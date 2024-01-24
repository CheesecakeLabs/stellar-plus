export type DebugData = {
  elapsedTime: string
  meta: any
} & TransactionResources

export type TransactionResources = {
  logs: string[]
}
