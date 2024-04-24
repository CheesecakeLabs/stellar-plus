import { StellarPlusError } from 'stellar-plus/error'

export enum DefaultHorizonHandlerErrorCodes {
  // CE0 General
  DHH001 = 'DHH001',
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

export const DHHError = {
  missingHorizonUrl,
}
