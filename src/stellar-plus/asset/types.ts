import { Horizon as HorizonNamespace } from '@stellar/stellar-sdk'

import { TransactionInvocation } from 'stellar-plus/core/types'
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
  allowance: (from: Address, spender: Address) => Promise<i128>
  approve: (from: Address, spender: Address, amount: i128, live_until_ledger: u32) => Promise<void>
  balance: (id: string) => Promise<number>
  spendable_balance: (id: Address) => Promise<i128>
  transfer: (from: string, to: string, amount: i128, txInvocation: TransactionInvocation) => Promise<void>
  transfer_from: (spender: Address, from: Address, to: Address, amount: i128) => Promise<void>
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
