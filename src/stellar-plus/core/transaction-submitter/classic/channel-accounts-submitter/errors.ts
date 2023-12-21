import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { StellarPlusError } from 'stellar-plus/error'
import { extractDataFromSubmitTransactionError } from 'stellar-plus/error/horizon'

export enum ChannelAccountsTransactionSubmitterErrorCodes {
  // CHATS0 General
  CHATS001 = 'CHATS001',
  CHATS002 = 'CHATS002',
}

const failedToReleaseChannelNotFound = (publicKey: string): StellarPlusError => {
  return new StellarPlusError({
    code: ChannelAccountsTransactionSubmitterErrorCodes.CHATS001,
    message: 'Failed to release channel!',
    source: 'ChannelAccountsTransactionSubmitter',
    details: `Failed to release channel! The channel account ${publicKey} was not found in the list of locked channels!`,
  })
}

const failedToSubmitTransaction = (error: Error, tx: Transaction | FeeBumpTransaction): StellarPlusError => {
  return new StellarPlusError({
    code: ChannelAccountsTransactionSubmitterErrorCodes.CHATS002,
    message: 'Failed to submit transaction!',
    source: 'ChannelAccountsTransactionSubmitter',
    details: `Failed to submit transaction! A problem occurred while submitting the transaction to the network for processing! Check the meta property for more details.`,
    meta: {
      error,
      transactionXDR: tx.toXDR(),
    },
  })
}

const transactionSubmittedFailed = (response: HorizonApi.SubmitTransactionResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ChannelAccountsTransactionSubmitterErrorCodes.CHATS002,
    message: 'Failed to submit transaction!',
    source: 'ChannelAccountsTransactionSubmitter',
    details: `Failed to submit transaction! A problem occurred while submitting the transaction to the network for processing! Check the meta property for more details.`,
    meta: {
      horizonSubmitTransactionData: extractDataFromSubmitTransactionError(response),
    },
  })
}

export const CHATSError = {
  failedToReleaseChannelNotFound,
  failedToSubmitTransaction,
  transactionSubmittedFailed,
}
