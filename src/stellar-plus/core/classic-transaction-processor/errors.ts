import { StellarPlusError } from 'stellar-plus/error'
import { extractTransactionInvocationMeta } from 'stellar-plus/error/transaction-invocation'

import { FeeBumpHeader } from '../types'

export enum ClassicTransactionProcessorErrorCodes {
  // CTP0 General
  CTP001 = 'CTP001',
  CTP002 = 'CTP002',
  CTP003 = 'CTP003',
}

const wrappingFeeBumpWithFeeBump = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP001,
    message: 'Failed to wrap fee bump!',
    source: 'ClassicTransactionProcessor',
    details:
      'Cannot wrap a fee bump transaction with another fee bump transaction. Make sure that the inner transaction is a normal transaction envelope.',
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
      transactionInvocation: extractTransactionInvocationMeta(feeBump, true),
    },
  })
}

export const CTPError = {
  wrappingFeeBumpWithFeeBump,
  missingSignerPublicKey,
  failedToWrapFeeBump,
}
