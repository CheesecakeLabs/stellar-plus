import { Transaction } from '@stellar/stellar-sdk'

import { AccountBase } from '@account/base/types'
import { AccountHelpersPayload } from '@account/helpers/types'
import { TransactionXdr } from '@stellar-plus/types'

export type AccountHandler = AccountBase & {
  sign(tx: Transaction): Promise<TransactionXdr> | TransactionXdr
}

export type AccountHandlerPayload = AccountHelpersPayload
