import { ContractSpec } from '@stellar/stellar-sdk'

import { AssetType } from 'stellar-plus/asset/types'
import { Options } from 'stellar-plus/core/contract-engine/types'
import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { Network, i128, u32 } from 'stellar-plus/types'

export type SorobanTokenHandlerConstructorArgs = {
  networkConfig: Network
  contractParameters?: {
    spec?: ContractSpec
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
  ) => Promise<void>
  setAdmin: (
    args: {
      id: string
      new_admin: string
    } & TransactionInvocation
  ) => Promise<void>

  admin: (args: TransactionInvocation) => Promise<string>

  setAuthorized: (
    args: {
      id: string
      authorize: boolean
    } & TransactionInvocation
  ) => Promise<void>

  mint: (
    args: {
      to: string
      amount: i128
    } & TransactionInvocation
  ) => Promise<void>

  clawback: (
    args: {
      from: string
      amount: i128
    } & TransactionInvocation
  ) => Promise<void>
}

export type SorobanTokenInterfaceUser = {
  allowance: (args: { from: string; spender: string } & SorobanSimulationInvocation) => Promise<i128>
  approve: (
    args: { from: string; spender: string; amount: i128; expiration_ledger: u32 } & TransactionInvocation
  ) => Promise<void>
  balance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  spendableBalance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  transfer: (args: { from: string; to: string; amount: i128 } & TransactionInvocation) => Promise<void>
  transferFrom: (
    args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  ) => Promise<void>
  burn: (args: { from: string; amount: i128 } & TransactionInvocation) => Promise<void>
  burnFrom: (args: { spender: string; from: string; amount: i128 } & TransactionInvocation) => Promise<void>
  decimals: (args: SorobanSimulationInvocation) => Promise<u32>
  name: (args: SorobanSimulationInvocation) => Promise<string>
  symbol: (args: SorobanSimulationInvocation) => Promise<string>
}
