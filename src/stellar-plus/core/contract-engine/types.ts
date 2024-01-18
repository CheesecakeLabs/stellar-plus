import { ContractSpec } from '@stellar/stellar-sdk'

import { TransactionInvocation } from 'stellar-plus/core/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network } from 'stellar-plus/types'

export type ContractEngineConstructorArgs = {
  network: Network
  spec: ContractSpec
  contractId?: string
  rpcHandler?: RpcHandler
  wasm?: Buffer
  wasmHash?: string
  options?: Options
}

export type Options = {
  debug?: boolean
  costHandler?: (methodName: string, costs: TransactionResources, elapsedTime: number, feeCharged: number) => void
  restoreTxInvocation?: TransactionInvocation
}

export type TransactionResources = {
  cpuInstructions?: number
  ram?: number
  minResourceFee?: number
  ledgerReadBytes?: number
  ledgerWriteBytes?: number
  ledgerEntryReads?: number
  ledgerEntryWrites?: number
  eventSize?: number
  returnValueSize?: number
  transactionSize?: number
}
