import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountBase } from 'stellar-plus/account/base/types'
import { AccountHelpersPayload } from 'stellar-plus/account/helpers/types'
import { TransactionXdr } from 'stellar-plus/types'

export type AccountHandler = AccountBase & {
  sign(tx: Transaction | FeeBumpTransaction): Promise<TransactionXdr> | TransactionXdr
}

export type AccountHandlerPayload = AccountHelpersPayload
