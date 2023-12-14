import { AccountHelpers, AccountHelpersPayload } from 'stellar-plus/account/helpers/types'

export type AccountBase = AccountHelpers & {
  publicKey?: string
  getPublicKey(): string
}

export type AccountBasePayload = AccountHelpersPayload & {
  publicKey: string
}
