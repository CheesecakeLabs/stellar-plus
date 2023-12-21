import { StellarPlusError } from 'stellar-plus/error'

export enum DefaultAccountHandlerErrorCodes {
  // DAH0 General
  DAH001 = 'DAH001',
  DAH002 = 'DAH002',
}

const failedToLoadSecretKeyError = (): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultAccountHandlerErrorCodes.DAH001,
    message: 'Failed to load secret key!',
    source: 'DefaultAccountHandler',
    details:
      'The secret key could not be loaded. Make sure that the secret key is correct and that it is a valid Stellar secret key.',
  })
}

const failedToSignTransactionError = (): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultAccountHandlerErrorCodes.DAH002,
    message: 'Failed to sign transaction!',
    source: 'DefaultAccountHandler',
    details: 'The transaction could not be signed. Review the secret key.',
  })
}

export const DAHError = {
  failedToLoadSecretKeyError,
  failedToSignTransactionError,
}
