import { DefaultAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/default/errors'
import { FreighterAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/freighter/errors'
import { FriendbotErrorCodes } from 'stellar-plus/account/helpers/friendbot/errors'
import { ClassicAssetHandlerErrorCodes } from 'stellar-plus/asset/classic/errors'
import { ChannelAccountsErrorCodes } from 'stellar-plus/channel-accounts/errors'
import { ClassicTransactionProcessorErrorCodes } from 'stellar-plus/core/classic-transaction-processor/errors'
import { ContractEngineErrorCodes } from 'stellar-plus/core/contract-engine/errors'

import { AxiosErrorInfo } from './axios'
import { SimulationErrorInfo } from './soroban-rpc'

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
  | GeneralErrorCodes
  | FriendbotErrorCodes
  | DefaultAccountHandlerErrorCodes
  | FreighterAccountHandlerErrorCodes
  | ClassicAssetHandlerErrorCodes
  | ChannelAccountsErrorCodes
  | ClassicTransactionProcessorErrorCodes
  | ContractEngineErrorCodes

export enum GeneralErrorCodes {
  ER000 = 'ER000',
}

export type Meta = {
  axiosError?: AxiosErrorInfo
  sorobanSimulationError?: SimulationErrorInfo
}
