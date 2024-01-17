import { StellarPlusError } from 'stellar-plus/error'

export enum CustomAccountHandlerErrorCodes {
  // CAH0 General
  CAH001 = 'DAH001',
  CAH002 = 'DAH002',
}

const failedToLoadPublicKeyError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: CustomAccountHandlerErrorCodes.CAH001,
    message: 'Failed to load public key!',
    source: 'CustomAccountHandler',
    details:
      'The public key could not be loaded. Make sure that the public key is correct and that it is a valid Stellar secret key.',
    meta: {
      error,
    },
  })
}

const failedToSignTransactionError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: CustomAccountHandlerErrorCodes.CAH002,
    message: 'Failed to sign transaction!',
    source: 'CustomAccountHandler',
    details: 'The transaction could not be signed. Review the public key and signer function.',
    meta: {
      error,
    },
  })
}

export const CAHError = {
  failedToLoadPublicKeyError,
  failedToSignTransactionError,
}
