import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'
import { AxiosError } from 'axios'

import { StellarPlusError } from 'stellar-plus/error'
import { extractAxiosErrorInfo } from 'stellar-plus/error/axios'
import { extractDataFromSubmitTransactionError } from 'stellar-plus/error/horizon'
import { extractTransactionData } from 'stellar-plus/error/transaction'

export enum DefaultTransactionSubmitterErrorCodes {
  // DTS0 General
  DTS001 = 'DTS001',
  DTS002 = 'DTS002',
}

const failedToSubmitTransaction = (
  error: Error | AxiosError,
  tx: Transaction | FeeBumpTransaction
): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultTransactionSubmitterErrorCodes.DTS001,
    message: 'Failed to submit transaction!',
    source: 'DefaultTransactionSubmitter',
    details: `Failed to submit transaction! A problem occurred while submitting the transaction to the network for processing! Check the meta property for more details.`,
    meta: {
      message: error.message,

      transactionData: extractTransactionData(tx),
      axiosError: error instanceof AxiosError ? extractAxiosErrorInfo(error as AxiosError) : undefined,
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
