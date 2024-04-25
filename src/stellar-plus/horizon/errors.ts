import { StellarPlusError } from 'stellar-plus/error'

export enum DefaultHorizonHandlerErrorCodes {
  // CE0 General
  DHH001 = 'DHH001',
  DHH002 = 'DHH002',
}

const missingHorizonUrl = (): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultHorizonHandlerErrorCodes.DHH001,
    message: 'Missing Horizon Url!',
    source: 'Default Horizon Handler',
    details:
      'The Default Horizon Handler requires an Horizon Url to be defined in the network configuration. Review the network configuration object provided and make sure it has url to connect directly with the Horizon API.',
  })
}

const failedToLoadAccount = (): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultHorizonHandlerErrorCodes.DHH002,
    message: 'Failed to load account from Horizon server.',
    source: 'Default Horizon Handler',
    details:
      'Failed to load account from Horizon server. An unexpected error occurred while trying to load the account from the Horizon server.',
  })
}
export const DHHError = {
  missingHorizonUrl,
  failedToLoadAccount,
}
