import { ContractSpec } from '@stellar/stellar-sdk'

import { RpcHandler } from '@rpc/types'
import { Network } from '@stellar-plus/types'

export type ContractEngineConstructorArgs = {
  network: Network
  spec: ContractSpec
  contractId?: string
  rpcHandler?: RpcHandler
  wasm?: Buffer
  wasmHash?: string
  options?: {
    debug?: boolean,
    costHandler?: (methodName: string, costs: TransactionCosts) => void;
  }
}

export type TransactionCosts = {
  cpuInstructions?: number;
  ram?: number;
  minResourceFee?: string;
  ledgerReadBytes?: number;
  ledgerWriteBytes?: number;
  ledgerEntryReads?: number;
  ledgerEntryWrites?: number;
  eventSize?: number;
  returnValueSize?: number;
  transactionSize?: number;
}
