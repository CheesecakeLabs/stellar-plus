import { StellarPlusError } from 'stellar-plus/error'
import { Meta } from 'stellar-plus/error/types'

export enum FreighterAccountHandlerErrorCodes {
  // FAH0 General
  FAH001 = 'FAH001',
  FAH002 = 'FAH002',
  FAH003 = 'FAH003',
  FAH004 = 'FAH004',
}

const throwFreighterAccountHandlerError = (
  code: FreighterAccountHandlerErrorCodes,
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

const connectedToWrongNetworkError = (targetNetworkName: string): void => {
  throwFreighterAccountHandlerError(
    FreighterAccountHandlerErrorCodes.FAH001,
    'Connected to wrong network!',
    `The Freighter account is connected to the wrong network. Make sure that the Freighter account is connected to the ${targetNetworkName} network.`
  )
}

const failedToLoadPublicKeyError = (): void => {
  throwFreighterAccountHandlerError(
    FreighterAccountHandlerErrorCodes.FAH002,
    'Failed to load public key!',
    "The Account's public key could not be loaded. Make sure that the Freighter account is connected to the correct network."
  )
}

const failedToSignTransactionError = (): void => {
  throwFreighterAccountHandlerError(
    FreighterAccountHandlerErrorCodes.FAH003,
    'Failed to sign transaction!',
    'The transaction could not be signed. Review the Freighter extension.'
  )
}

const freighterIsNotConnectedError = (): void => {
  throwFreighterAccountHandlerError(
    FreighterAccountHandlerErrorCodes.FAH004,
    'Freighter is not connected!',
    'Freighter is not connected. User needs to accept the connection request from the Freighter extension before proceeding.'
  )
}

export const throwFreighterError = {
  connectedToWrongNetworkError,
  failedToLoadPublicKeyError,
  failedToSignTransactionError,
  freighterIsNotConnectedError,
}
