import { Transaction } from '@stellar/stellar-sdk'

import { AccountHandler, AccountHandlerPayload } from '@account/account-handler/types'
import { TransactionXdr } from '@stellar-plus/types'

export type DefaultAccountHandler = AccountHandler & {
  sign(tx: Transaction): TransactionXdr
}

//
// When the secret key is not provided, a random keypair is generated.
//
export type DefaultAccountHandlerPayload = AccountHandlerPayload & {
  secretKey?: string
}
