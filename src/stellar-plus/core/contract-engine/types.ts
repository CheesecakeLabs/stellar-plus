import { ContractSpec } from '@stellar/stellar-sdk'

import { SorobanTransactionPipelineOptions } from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network } from 'stellar-plus/types'

export type ContractEngineConstructorArgs = {
  networkConfig: Network
  contractParameters: {
    spec: ContractSpec
    contractId?: string
    wasm?: Buffer
    wasmHash?: string
  }
  options?: Options
}

export type Options = {
  customRpcHandler?: RpcHandler
  transactionPipeline?: SorobanTransactionPipelineOptions
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
