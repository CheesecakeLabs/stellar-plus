import { xdr } from '@stellar/stellar-sdk'

export const extractSorobanResultXdrOpErrorCode = (resultXdr: xdr.TransactionResult): string => {
  return resultXdr.result().results()[0].tr().value().switch().name
}

export enum SorobanOpCodes {
  invokeHostFunctionEntryArchived = 'invokeHostFunctionEntryArchived',
  restoreFootprintSuccess = 'restoreFootprintSuccess',
}
