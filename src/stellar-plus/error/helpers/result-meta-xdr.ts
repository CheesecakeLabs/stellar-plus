import { xdr } from '@stellar/stellar-sdk'

export const extractSorobanResultXdrOpErrorCode = (resultXdr: xdr.TransactionResult | string): string => {
  if (typeof resultXdr === 'string') {
    const resultXdrObject = xdr.TransactionResult.fromXDR(resultXdr, 'base64')
    return resultXdrObject.result().results()[0].tr().value().switch().name
  }
  try {
    if (resultXdr.result?.().results !== undefined
      && typeof resultXdr.result?.().results === 'function') {
      return resultXdr.result?.().results?.()[0].tr?.().value?.().switch?.().name
    }
  } catch (error) {
    console.log("Xdr don't have results: %s", error)
  }
  try {
    if (resultXdr.result?.().switch !== undefined
      && typeof resultXdr.result?.().switch === 'function') {
      return resultXdr.result?.().switch?.().name
    }
  }
  catch (error) {
    console.log('Fail in decode xdr: %s, Error: %s', resultXdr, error)
    return "fail_in_decode_xdr"
  }
  return "not_found"
}

export enum SorobanOpCodes {
  invokeHostFunctionEntryArchived = 'invokeHostFunctionEntryArchived',
  restoreFootprintSuccess = 'restoreFootprintSuccess',
}
