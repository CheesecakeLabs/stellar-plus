import { AccountBase } from '@account/base/types'
import { AccountHelpersPayload } from '@account/helpers/types'
import { Transaction, TransactionXdr } from '@stellar-plus/types'

export type AccountHandler = AccountBase & {
  sign(tx: Transaction): Promise<TransactionXdr> | TransactionXdr
}

export type AccountHandlerPayload = AccountHelpersPayload
