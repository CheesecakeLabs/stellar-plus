import { StellarPlusError } from 'stellar-plus/error'

export enum FreighterAccountHandlerErrorCodes {
  // FAH0 General
  FAH001 = 'FAH001',
  FAH002 = 'FAH002',
  FAH003 = 'FAH003',
  FAH004 = 'FAH004',
}

const connectedToWrongNetworkError = (targetNetworkName: string): void => {
  throw new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH001,
    message: 'Connected to wrong network!',
    source: 'FreighterAccountHandler',
    details: `The Freighter account is connected to the wrong network. Make sure that the Freighter account is connected to the ${targetNetworkName}.`,
  })
}

const failedToLoadPublicKeyError = (): void => {
  throw new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH002,
    message: 'Failed to load public key!',
    source: 'FreighterAccountHandler',
    details: 'The public key could not be loaded. Make sure that the Freighter account is connected.',
  })
}

const failedToSignTransactionError = (): void => {
  throw new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH003,
    message: 'Failed to sign transaction!',
    source: 'FreighterAccountHandler',
    details: 'The transaction could not be signed. Review the Freighter account.',
  })
}

const freighterIsNotConnectedError = (): void => {
  throw new StellarPlusError({
    code: FreighterAccountHandlerErrorCodes.FAH004,
    message: 'Freighter is not connected!',
    source: 'FreighterAccountHandler',
    details: 'Freighter is not connected. Make sure that the Freighter account is connected.',
  })
}

export const throwFreighterError = {
  connectedToWrongNetworkError,
  failedToLoadPublicKeyError,
  failedToSignTransactionError,
  freighterIsNotConnectedError,
}
