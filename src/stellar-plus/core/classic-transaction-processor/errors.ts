import { StellarPlusError } from 'stellar-plus/error'

export enum ClassicTransactionProcessorErrorCodes {
  // CTP0 General
  CTP001 = 'CTP001',
  CTP002 = 'CTP002',
}

const wrappingFeeBumpWithFeeBump = (): void => {
  throw new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP001,
    message: 'Failed to wrap fee bump!',
    source: 'ClassicTransactionProcessor',
    details:
      'Cannot wrap a fee bump transaction with another fee bump transaction. Make sure that the inner transaction is a normal transaction envelope.',
  })
}

const missingSignerPublicKey = (publicKey: string): void => {
  throw new StellarPlusError({
    code: ClassicTransactionProcessorErrorCodes.CTP002,
    message: 'Missing signer public key!',
    source: 'ClassicTransactionProcessor',
    details: `Missing signer public key: ${publicKey}. Make sure to include a AccountHandler for this account as a signer in the Transaction Invocation object.`,
  })
}

export const throwClassicTransactionProcessorError = {
  wrappingFeeBumpWithFeeBump,
  missingSignerPublicKey,
}
