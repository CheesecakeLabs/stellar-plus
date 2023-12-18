import { Horizon as HorizonNamespace } from '@stellar/stellar-sdk'

import { SorobanSimulationInvocation, TransactionInvocation } from 'stellar-plus/core/types'
import { Address, i128, u32 } from 'stellar-plus/types'

export type TokenInterface = TokenInterfaceManagement & TokenInterfaceUser

export type TokenInterfaceManagement = {
  set_admin: (
    args: {
      id: Address
      new_admin: Address
    } & TransactionInvocation
  ) => Promise<void>

  admin: (args: TransactionInvocation) => Promise<Address>

  set_authorized: (
    args: {
      id: Address
      authorize: boolean
    } & TransactionInvocation
  ) => Promise<void>

  mint: (
    to: string,
    amount: i128,
    txInvocation: TransactionInvocation
  ) => Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse>

  clawback: (
    args: {
      from: Address
      amount: i128
    } & TransactionInvocation
  ) => Promise<void>
}

export type TokenInterfaceUser = {
  allowance: (args: { from: string; spender: string } & SorobanSimulationInvocation) => Promise<i128>
  approve: (
    args: { from: string; spender: string; amount: i128; live_until_ledger: u32 } & TransactionInvocation
  ) => Promise<void>
  balance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  spendable_balance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  transfer: (args: { from: string; to: string; amount: i128 } & TransactionInvocation) => Promise<void>
  transfer_from: (
    args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  ) => Promise<void>

  burn: (from: Address, amount: i128) => Promise<void>
  burn_from: (spender: Address, from: Address, amount: i128) => Promise<void>
  decimals: () => Promise<u32>
  name: () => Promise<string>
  symbol: () => Promise<string>
}

export enum AssetTypes {
  native = 'native',
  credit_alphanum4 = 'credit_alphanum4',
  credit_alphanum12 = 'credit_alphanum12',
  SAC = 'SAC',
  token = 'token',
  liquidity_pool_shares = 'liquidity_pool_shares',
}
