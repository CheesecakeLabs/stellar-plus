import { Spec } from '@stellar/stellar-sdk/contract'

import { AssetType } from 'stellar-plus/asset/types'
import { Options } from 'stellar-plus/core/contract-engine/types'
import { SorobanTransactionPipelineOutputSimple } from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { NetworkConfig, i128, u32 } from 'stellar-plus/types'

export type SorobanTokenHandlerConstructorArgs = {
  networkConfig: NetworkConfig
  contractParameters?: {
    spec?: Spec
    contractId?: string
    wasm?: Buffer
    wasmHash?: string
  }
  options?: Options
}

export type SorobanTokenInterface = AssetType & SorobanTokenInterfaceManagement & SorobanTokenInterfaceUser

export type SorobanTokenInterfaceManagement = {
  initialize: (
    args: { admin: string; decimal: u32; name: string; symbol: string } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  setAdmin: (
    args: {
      id: string
      new_admin: string
    } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>

  admin: (args: TransactionInvocation) => Promise<string>

  setAuthorized: (
    args: {
      id: string
      authorize: boolean
    } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>

  mint: (
    args: {
      to: string
      amount: i128
    } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>

  clawback: (
    args: {
      from: string
      amount: i128
    } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
}

export type SorobanTokenInterfaceUser = {
  allowance: (args: { from: string; spender: string } & SorobanSimulationInvocation) => Promise<i128>
  approve: (
    args: { from: string; spender: string; amount: i128; expiration_ledger: u32 } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  balance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  spendableBalance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  transfer: (
    args: { from: string; to: string; amount: i128 } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  transferFrom: (
    args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  burn: (
    args: { from: string; amount: i128 } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  burnFrom: (
    args: { spender: string; from: string; amount: i128 } & TransactionInvocation
  ) => Promise<SorobanTransactionPipelineOutputSimple>
  decimals: (args: SorobanSimulationInvocation) => Promise<u32>
  name: (args: SorobanSimulationInvocation) => Promise<string>
  symbol: (args: SorobanSimulationInvocation) => Promise<string>
}
