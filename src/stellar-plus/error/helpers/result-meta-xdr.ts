import { xdr } from '@stellar/stellar-sdk'

export const extractSorobanResultXdrOpErrorCode = (resultXdr: xdr.TransactionResult | string): string => {
  if (typeof resultXdr === 'string') {
    const resultXdrObject = xdr.TransactionResult.fromXDR(resultXdr, 'base64')
    return resultXdrObject.result().results()[0].tr().value().switch().name
  }
  return resultXdr.result().results()[0].tr().value().switch().name
}

export enum SorobanOpCodes {
  invokeHostFunctionEntryArchived = 'invokeHostFunctionEntryArchived',
  restoreFootprintSuccess = 'restoreFootprintSuccess',
}
