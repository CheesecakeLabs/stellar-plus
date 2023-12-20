import { StellarPlusError } from 'stellar-plus/error'
import { Meta } from 'stellar-plus/error/types'

export enum DefaultAccountHandlerErrorCodes {
  // DAH0 General
  DAH001 = 'DAH001',
  DAH002 = 'DAH002',
}

const throwDefaultAccountHandlerError = (
  code: DefaultAccountHandlerErrorCodes,
  message: string,
  details: string,
  meta?: Meta
): void => {
  throw new StellarPlusError({
    code,
    message,
    source: 'DefaultAccountHandler',
    details,
    meta,
  })
}

export const failedToLoadSecretKeyError = (): void => {
  throwDefaultAccountHandlerError(
    DefaultAccountHandlerErrorCodes.DAH001,
    'Invalid Secret Key!',
    "The Account's secret key is invalid and couldn't be used to initialize a Keypair. Make sure that the secret key is correct and that it is a valid Stellar secret key."
  )
}

export const failedToSignTransactionError = (): void => {
  throwDefaultAccountHandlerError(
    DefaultAccountHandlerErrorCodes.DAH002,
    'Failed to sign transaction!',
    'The transaction could not be signed. Make sure that the secret key is correct and that it is a valid Stellar secret key.'
  )
}
