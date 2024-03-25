import { StellarPlusError } from 'stellar-plus/error'

export enum FreighterAccountHandlerErrorCodes {
  // FAH0 General
  FAH001 = 'FAH001',
  FAH002 = 'FAH002',
  FAH003 = 'FAH003',
  FAH004 = 'FAH004',
  FAH005 = 'FAH005',
  FAH006 = 'FAH006',
}

const connectedToWrongNetworkError = (targetNetworkName: string, error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH001,
    message: 'Connected to wrong network!',
    source: 'FreighterAccountHandler',
    details: `The Freighter account is connected to the wrong network. Make sure that the Freighter account is connected to the ${targetNetworkName}.`,
    meta: { error },
  })
}

const failedToLoadPublicKeyError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH002,
    message: 'Failed to load public key!',
    source: 'FreighterAccountHandler',
    details: 'The public key could not be loaded. Make sure that the Freighter account is connected.',
    meta: { error },
  })
}

const failedToSignTransactionError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH003,
    message: 'Failed to sign transaction!',
    source: 'FreighterAccountHandler',
    details: 'The transaction could not be signed. Review the Freighter account.',
    meta: { error },
  })
}

const freighterIsNotConnectedError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH004,
    message: 'Freighter is not connected!',
    source: 'FreighterAccountHandler',
    details: 'Freighter is not connected. Make sure that the Freighter account is connected.',
    meta: { error },
  })
}

const failedToSignAuthEntryError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH005,
    message: 'Failed to sign soroban authorization entry!',
    source: 'FreighterAccountHandler',
    details:
      'An error occurred while signing the soroban authorization entry. Review the Freighter account and meta for more details.',
    meta: { error },
  })
}

const cannotSignForThisNetwork = (entryNetwork: string, freighterNetwork: string, error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH006,
    message: 'Failed to soroban authorization entry!',
    source: 'FreighterAccountHandler',
    details: `An error occurred while signing the soroban authorization entry. The network passphrase provided to sign this entry differs from the one initialized in the Freighter account handler. Entry network passphrase: ${entryNetwork}, Freighter network passphrase: ${freighterNetwork}.`,
    meta: { error },
  })
}

export const FAHError = {
  connectedToWrongNetworkError,
  failedToLoadPublicKeyError,
  failedToSignTransactionError,
  freighterIsNotConnectedError,
  failedToSignAuthEntryError,
  cannotSignForThisNetwork,
}
