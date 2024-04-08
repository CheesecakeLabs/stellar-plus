import { FeeBumpTransaction, Transaction, xdr } from '@stellar/stellar-sdk'

import { HorizonHandler } from 'stellar-plus'
import { AccountBase } from 'stellar-plus/account/base/types'
import { NetworkConfig } from 'stellar-plus/constants'
import { TransactionXdr } from 'stellar-plus/types'

export type AccountHandler = AccountBase & {
  getPublicKey(): string
  sign(tx: Transaction | FeeBumpTransaction): Promise<TransactionXdr> | TransactionXdr
  signSorobanAuthEntry(
    entry: xdr.SorobanAuthorizationEntry,
    validUntilLedgerSeq: number,
    networkPassphrase: string
  ): Promise<xdr.SorobanAuthorizationEntry>
  signatureSchema?: SignatureSchema
}

export type AccountHandlerPayload = {
  networkConfig?: NetworkConfig
  horizonHandler?: HorizonHandler
}

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
