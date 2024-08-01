import { Horizon } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { AssetType, AssetTypes } from 'stellar-plus/asset/types'
import { ClassicTransactionPipelineOptions } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { NetworkConfig } from 'stellar-plus/types'

export type ClassicAsset = AssetType & {
  code: string
  issuerPublicKey?: string
  type: AssetTypes.native | AssetTypes.credit_alphanum4 | AssetTypes.credit_alphanum12
}

export type ClassicAssetHandler = ClassicAsset & ClassicTokenInterface & ClassicUtils

export type ClassicAssetHandlerConstructorArgs = {
  code: string
  issuerAccount?: string | AccountHandler
  networkConfig: NetworkConfig

  options?: {
    classicTransactionPipeline?: ClassicTransactionPipelineOptions
  }
}

export type ClassicTokenInterface = ClassicTokenInterfaceManagement & ClassicTokenInterfaceUser

export type ClassicTokenInterfaceManagement = {
  mint: (
    args: {
      to: string
      amount: number
    } & TransactionInvocation
  ) => Promise<Horizon.HorizonApi.SubmitTransactionResponse>
}

export type ClassicTokenInterfaceUser = {
  balance: (id: string) => Promise<number>
  transfer: (args: { from: string; to: string; amount: number } & TransactionInvocation) => Promise<void>
  burn: (args: { from: string; amount: number } & TransactionInvocation) => Promise<void>
  decimals: () => Promise<number>
  name: () => Promise<string>
  symbol: () => Promise<string>
}

export type ClassicUtils = {
  addTrustlineAndMint: (
    args: { to: string; amount: number } & TransactionInvocation
  ) => Promise<Horizon.HorizonApi.SubmitTransactionResponse>
}
