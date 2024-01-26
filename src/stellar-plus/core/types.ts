import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { SupportedInnerPlugins as SorobanTransactionExecutionPlugin } from 'stellar-plus/core/pipelines/soroban-transaction/types'

export type TransactionInvocation = {
  signers: AccountHandler[]
  header: EnvelopeHeader
  feeBump?: FeeBumpHeader
  sponsor?: AccountHandler
  executionPlugins?: SorobanTransactionExecutionPlugin[]
}

export type SorobanSimulationInvocation = {
  header: EnvelopeHeader
}

export type EnvelopeHeader = {
  fee: string
  source: string
  timeout: number
}

export type FeeBumpHeader = {
  signers: AccountHandler[]
  header: EnvelopeHeader
}

export type SignatureRequirement = {
  publicKey: string
  thresholdLevel: SignatureThreshold
}

export enum SignatureThreshold {
  low = 1,
  medium = 2,
  high = 3,
}
