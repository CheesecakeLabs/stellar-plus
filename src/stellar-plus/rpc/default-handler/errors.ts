import { StellarPlusError } from 'stellar-plus/error'

export enum DefaultRpcHandlerErrorCodes {
  // CE0 General
  DRH001 = 'DRH001',
}

const missingRpcUrl = (): StellarPlusError => {
  return new StellarPlusError({
    code: DefaultRpcHandlerErrorCodes.DRH001,
    message: 'Missing RPC Url!',
    source: 'Default RPC Handler',
    details:
      'The Default RPC Handler requires an RPC Url to be defined in the network configuration. Review the network configuration object provided and make sure it has url to connect directly with the RPC server.',
  })
}

export const DRHError = {
  missingRpcUrl,
}
