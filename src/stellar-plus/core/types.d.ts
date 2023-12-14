import { AccountHandler } from 'stellar-plus/account/account-handler/types'

export type TransactionInvocation = {
  signers: AccountHandler[]
  header: EnvelopeHeader
  feeBump?: FeeBumpHeader
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
