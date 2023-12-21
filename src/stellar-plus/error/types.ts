import { DefaultAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/default/errors'
import { FreighterAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/freighter/errors'
import { FriendbotErrorCodes } from 'stellar-plus/account/helpers/friendbot/errors'
import { ClassicAssetHandlerErrorCodes } from 'stellar-plus/asset/classic/errors'
import { ChannelAccountsErrorCodes } from 'stellar-plus/channel-accounts/errors'
import { ClassicTransactionProcessorErrorCodes } from 'stellar-plus/core/classic-transaction-processor/errors'
import { ContractEngineErrorCodes } from 'stellar-plus/core/contract-engine/errors'
import { SorobanTransactionProcessorErrorCodes } from 'stellar-plus/core/soroban-transaction-processor/errors'
import { ChannelAccountsTransactionSubmitterErrorCodes } from 'stellar-plus/core/transaction-submitter/classic/channel-accounts-submitter/errors'

import { AxiosErrorInfo } from './axios'
import { SubmitTransactionMetaInfo } from './horizon'
import { GetTransactionErrorInfo, SendTransactionErrorInfo, SimulationErrorInfo } from './soroban-rpc'
import { TransactionInvocationMeta } from './transaction-invocation'

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
  | ContractEngineErrorCodes
  | ChannelAccountsErrorCodes
  | ClassicAssetHandlerErrorCodes
  | DefaultAccountHandlerErrorCodes
  | FreighterAccountHandlerErrorCodes
  | ClassicTransactionProcessorErrorCodes
  | SorobanTransactionProcessorErrorCodes
  | ChannelAccountsTransactionSubmitterErrorCodes

export enum GeneralErrorCodes {
  ER000 = 'ER000',
}

export type Meta = {
  error?: Error
  message?: string
  transactionXDR?: string
  axiosError?: AxiosErrorInfo
  sorobanSimulationData?: SimulationErrorInfo
  transactionInvocation?: TransactionInvocationMeta
  sorobanGetTransactionData?: GetTransactionErrorInfo
  sorobanSendTransactionData?: SendTransactionErrorInfo
  horizonSubmitTransactionData?: SubmitTransactionMetaInfo
}
