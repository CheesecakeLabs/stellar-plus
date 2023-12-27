import { StellarPlusError } from 'stellar-plus/error'
import { TransactionInvocationMeta, extractTransactionInvocationMeta } from 'stellar-plus/error/helpers/transaction'

import { FeeBumpHeader } from '../types'

export enum ClassicTransactionProcessorErrorCodes {
  // CTP0 General
  CTP001 = 'CTP001',
  CTP002 = 'CTP002',
  CTP003 = 'CTP003',
}

const wrappingFeeBumpWithFeeBump = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP001,
    message: 'Failed to wrap fee bump!',
    source: 'ClassicTransactionProcessor',
    details:
      'Cannot wrap a fee bump transaction with another fee bump transaction. Make sure that the inner transaction is a normal transaction envelope.',
    meta: { error },
  })
}

const missingSignerPublicKey = (publicKey: string): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP002,
    message: 'Missing signer public key!',
    source: 'ClassicTransactionProcessor',
    details: `Missing signer public key: ${publicKey}. Make sure to include a AccountHandler for this account as a signer in the Transaction Invocation object.`,
  })
}

const failedToWrapFeeBump = (error: Error, feeBump: FeeBumpHeader): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP003,
    message: 'Failed to wrap fee bump!',
    source: 'ClassicTransactionProcessor',
    details: `Failed to wrap fee bump! A problem occurred while wrapping the fee bump transaction! Check the meta property for more details.`,
    meta: {
      message: error.message,
      error,
      transactionInvocation: extractTransactionInvocationMeta(feeBump, true) as TransactionInvocationMeta,
    },
  })
}

export const CTPError = {
  wrappingFeeBumpWithFeeBump,
  missingSignerPublicKey,
  failedToWrapFeeBump,
}