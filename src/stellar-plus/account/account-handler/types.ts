import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountBase } from 'stellar-plus/account/base/types'
import { AccountHelpersPayload } from 'stellar-plus/account/helpers/types'
import { TransactionXdr } from 'stellar-plus/types'

export type AccountHandler = AccountBase & {
  getPublicKey(): string
  sign(tx: Transaction | FeeBumpTransaction): Promise<TransactionXdr> | TransactionXdr
  signatureSchema?: SignatureSchema
}

export type AccountHandlerPayload = AccountHelpersPayload

export type SignatureSchema = {
  threasholds: {
    low: number
    medium: number
    high: number
  }
  signers: {
    weight: number
    publicKey: string
  }[]
}
