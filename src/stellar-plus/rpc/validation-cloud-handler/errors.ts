import { StellarPlusError } from 'stellar-plus/error'

import { RequestPayload } from './types'

export enum ValidationCloudRpcHandlerErrorCodes {
  // VCRPC0 General
  VCRPC001 = 'VCRPC001',
  VCRPC002 = 'VCRPC002',
}

const invalidApiKey = (): StellarPlusError => {
  return new StellarPlusError({
    code: ValidationCloudRpcHandlerErrorCodes.VCRPC001,
    message: 'Invalid API key!',
    source: 'ValidationCloudRpcHandler',
    details: `Invalid API key! The provided API key is invalid! Make sure to generate a valid API key on the validationcloud.io website and use it to initialize the ValidationCloudRpcHandler.`,
  })
}

const failedToInvokeVCApi = (error: Error, payload: RequestPayload): StellarPlusError => {
  return new StellarPlusError({
    code: ValidationCloudRpcHandlerErrorCodes.VCRPC002,
    message: 'Failed to invoke Validation Cloud API!',
    source: 'ValidationCloudRpcHandler',
    details: `Failed to invoke Validation Cloud API! A problem occurred while invoking the Validation Cloud API! Check the meta property for more details.`,
    meta: {
      error,
      data: { payload },
    },
  })
}

export const VCRPCError = {
  invalidApiKey,
  failedToInvokeVCApi,
}
