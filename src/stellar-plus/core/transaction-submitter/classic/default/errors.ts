import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'
import { AxiosError } from 'axios'

import { StellarPlusError } from 'stellar-plus/error'
import { diagnoseSubmitError, extractDataFromSubmitTransactionError } from 'stellar-plus/error/helpers/horizon'

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
    ...diagnoseSubmitError(error, tx),
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
      data: { response },
    },
  })
}

export const DTSError = {
  failedToSubmitTransaction,
  transactionSubmittedFailed,
}
