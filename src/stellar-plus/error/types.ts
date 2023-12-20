import { FriendbotErrorCodes } from 'stellar-plus/account/helpers/friendbot/errors'

import { AxiosErrorInfo } from './axios'

export type StellarPlusErrorObject = {
  code: ErrorCodes
  message: string
  source: string
  details?: string
  meta?: Meta
}

// export type ErrorSources = FriendbotErrorSources
// HorizonApi = 'HorizonApi',
// SorobanRpc = 'SorobanRpc',
// ClassicTransaction = 'ClassicTransaction',
// SorobanTransaction = 'SorobanTransaction',

export type ErrorCodes =
  // | HorizonApiErrorCodes
  // | SorobanRpcErrorCodes
  // | ClassicTransactionErrorCodes
  // | SorobanTransactionErrorCodes
  FriendbotErrorCodes

export type Meta = {
  axiosError?: AxiosErrorInfo
}
