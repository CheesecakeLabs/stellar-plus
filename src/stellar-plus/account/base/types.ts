import { AccountHelpers, AccountHelpersPayload } from 'stellar-plus/account/helpers/types'

export type AccountBase = AccountHelpers & {
  getPublicKey(): string
}

export type AccountBasePayload = AccountHelpersPayload & {
  publicKey: string
}
