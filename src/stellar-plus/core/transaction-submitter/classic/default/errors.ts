import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { StellarPlusError } from 'stellar-plus/error'
import { extractDataFromSubmitTransactionError } from 'stellar-plus/error/horizon'

export enum DefaultTransactionSubmitterErrorCodes {
  // DTS0 General
  DTS001 = 'DTS001',
  DTS002 = 'DTS002',
}

const failedToSubmitTransaction = (error: Error, tx: Transaction | FeeBumpTransaction): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultTransactionSubmitterErrorCodes.DTS001,
    message: 'Failed to submit transaction!',
    source: 'DefaultTransactionSubmitter',
    details: `Failed to submit transaction! A problem occurred while submitting the transaction to the network for processing! Check the meta property for more details.`,
    meta: {
      message: error.message,
      transactionXDR: tx.toXDR(),
    },
  })
}

const transactionSubmittedFailed = (response: HorizonApi.SubmitTransactionResponse): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultTransactionSubmitterErrorCodes.DTS002,
    message: 'Transaction Failed!',
    source: 'DefaultTransactionSubmitter',
    details: `Transaction submitted failed! A problem occurred while processing the transaction after submission! Check the meta property for more details.`,
    meta: {
      horizonSubmitTransactionData: extractDataFromSubmitTransactionError(response),
    },
  })
}

export const DTSError = {
  failedToSubmitTransaction,
  transactionSubmittedFailed,
}
