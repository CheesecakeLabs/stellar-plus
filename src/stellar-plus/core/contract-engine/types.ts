import { ContractSpec, SorobanDataBuilder, Asset as StellarAsset, xdr } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import {
  SorobanTransactionPipelineOptions,
  SupportedInnerPlugins,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { EnvelopeHeader, FeeBumpHeader, NetworkConfig, TransactionInvocation } from 'stellar-plus/types'

export type ContractEngineConstructorArgs = {
  networkConfig: NetworkConfig
  contractParameters: {
    spec?: ContractSpec
    contractId?: string
    wasm?: Buffer
    wasmHash?: string
  }
  options?: Options
}

export type Options = {
  sorobanTransactionPipeline?: SorobanTransactionPipelineOptions
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

export type SorobanInvokeArgs<T> = SorobanSimulateArgs<T> & {
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}

export type SorobanSimulateArgs<T> = {
  method: string
  methodArgs: T
  header: EnvelopeHeader
  executionPlugins?: SupportedInnerPlugins[]
}

export type SorobanUploadArgs = TransactionInvocation & {
  wasm: Buffer
}

export type SorobanDeployArgs = TransactionInvocation & {
  wasmHash: string
}

export type WrapClassicAssetArgs = TransactionInvocation & {
  asset: StellarAsset
}

export type ExtendFootprintTTLArgs = TransactionInvocation & {
  extendTo: number
  footprint: xdr.LedgerFootprint
}

export type RestoreFootprintArgs = TransactionInvocation &
  (RestoreFootprintWithLedgerKeys | RestoreFootprintWithRestorePreamble)

export type RestoreFootprintWithLedgerKeys = {
  keys: xdr.LedgerKey[]
}

export type RestoreFootprintWithRestorePreamble = {
  restorePreamble: {
    minResourceFee: string
    transactionData: SorobanDataBuilder
  }
}

export function isRestoreFootprintWithLedgerKeys(
  args: RestoreFootprintArgs
): args is RestoreFootprintWithLedgerKeys & TransactionInvocation {
  return 'keys' in args
}

export function isRestoreFootprintWithRestorePreamble(
  args: RestoreFootprintArgs
): args is RestoreFootprintWithRestorePreamble & TransactionInvocation {
  return 'restorePreamble' in args
}
