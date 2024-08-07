import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { AssetType, AssetTypes } from 'stellar-plus/asset/types'
import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOptions,
  ClassicTransactionPipelineOutput,
} from 'stellar-plus/core/pipelines/classic-transaction/types'
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
    } & BaseInvocation
  ) => Promise<ClassicTransactionPipelineOutput>

  setFlags: (args: { controlFlags: ControlFlags } & BaseInvocation) => Promise<ClassicTransactionPipelineOutput>
}

export type ClassicTokenInterfaceUser = {
  balance: (id: string) => Promise<number>
  transfer: (
    args: { from: string; to: string; amount: number } & BaseInvocation
  ) => Promise<ClassicTransactionPipelineOutput>
  burn: (args: { from: string; amount: number } & BaseInvocation) => Promise<ClassicTransactionPipelineOutput>
  decimals: () => Promise<number>
  name: () => Promise<string>
  symbol: () => Promise<string>
}

export type ClassicUtils = {
  addTrustlineAndMint: (
    args: { to: string; amount: number } & BaseInvocation
  ) => Promise<ClassicTransactionPipelineOutput>
  addTrustline: (args: { to: string } & BaseInvocation) => Promise<ClassicTransactionPipelineOutput>
}

export type ControlFlags = {
  authorizationRequired?: boolean
  authorizationRevocable?: boolean
  clawbackEnabled?: boolean
  authorizationImmutable?: boolean
}

export type BaseInvocation = TransactionInvocation & {
  options?: ClassicTransactionPipelineInput['options']
}
