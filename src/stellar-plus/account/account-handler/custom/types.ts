import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountHandlerPayload } from 'stellar-plus/account/account-handler/types'
import { TransactionXdr } from 'stellar-plus/types'

export type CustomAccountHandler = {
  sign(tx: Transaction | FeeBumpTransaction, customSign: (tx: Transaction | FeeBumpTransaction, publicKey: string) => Promise<TransactionXdr>): Promise<TransactionXdr>
}

export type CustomAccountHandlerPayload = AccountHandlerPayload & {
  customSign: (tx: Transaction | FeeBumpTransaction, publicKey: string) => Promise<TransactionXdr>
  publicKey: string
}
