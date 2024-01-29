import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { AssetType, AssetTypes } from 'stellar-plus/asset/types'
import { ClassicTransactionPipelineOptions } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { Network } from 'stellar-plus/types'

export type ClassicAsset = AssetType & {
  code: string
  issuerPublicKey: string
  type: AssetTypes.native | AssetTypes.credit_alphanum4 | AssetTypes.credit_alphanum12
}

export type ClassicAssetHandler = ClassicAsset & ClassicTokenInterface & ClassicUtils

export type ClassicAssetHandlerConstructorArgs = {
  code: string
  issuerAccount: string | AccountHandler
  networkConfig: Network

  options?: {
    clasicTransactionPipeline?: ClassicTransactionPipelineOptions
  }
}

export type ClassicTokenInterface = ClassicTokenInterfaceManagement & ClassicTokenInterfaceUser

export type ClassicTokenInterfaceManagement = {
  // set_admin: (
  //   args: {
  //     id: Address
  //     new_admin: Address
  //   } & TransactionInvocation
  // ) => Promise<void>

  // admin: (args: TransactionInvocation) => Promise<Address>

  // set_authorized: (
  //   args: {
  //     id: Address
  //     authorize: boolean
  //   } & TransactionInvocation
  // ) => Promise<void>

  mint: (
    args: {
      to: string
      amount: number
    } & TransactionInvocation
  ) => Promise<HorizonApi.SubmitTransactionResponse>

  // clawback: (
  //   args: {
  //     from: Address
  //     amount: i128
  //   } & TransactionInvocation
  // ) => Promise<void>
}

export type ClassicTokenInterfaceUser = {
  // allowance: (args: { from: string; spender: string }) => Promise<i128>
  // approve: (
  //   args: { from: string; spender: string; amount: i128; expiration_ledger: u32 } & TransactionInvocation
  // ) => Promise<void>
  balance: (id: string) => Promise<number>
  // spendable_balance: (args: { id: string } & SorobanSimulationInvocation) => Promise<i128>
  transfer: (args: { from: string; to: string; amount: number } & TransactionInvocation) => Promise<void>
  // transfer_from: (
  //   args: { spender: string; from: string; to: string; amount: i128 } & TransactionInvocation
  // ) => Promise<void>

  burn: (args: { from: string; amount: number } & TransactionInvocation) => Promise<void>
  // burn_from: (spender: Address, from: Address, amount: i128) => Promise<void>
  decimals: () => Promise<number>
  name: () => Promise<string>
  symbol: () => Promise<string>
}

export type ClassicUtils = {
  addTrustlineAndMint: (
    args: { to: string; amount: number } & TransactionInvocation
  ) => Promise<HorizonApi.SubmitTransactionResponse>
}
