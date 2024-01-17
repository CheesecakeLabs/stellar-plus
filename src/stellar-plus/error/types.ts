import { DefaultAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/default/errors'
import { FreighterAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/freighter/errors'
import { FriendbotErrorCodes } from 'stellar-plus/account/helpers/friendbot/errors'
import { ClassicAssetHandlerErrorCodes } from 'stellar-plus/asset/classic/errors'
import { ChannelAccountsErrorCodes } from 'stellar-plus/channel-accounts/errors'
import { ClassicTransactionProcessorErrorCodes } from 'stellar-plus/core/classic-transaction-processor/errors'
import { ContractEngineErrorCodes } from 'stellar-plus/core/contract-engine/errors'
import { SorobanTransactionProcessorErrorCodes } from 'stellar-plus/core/soroban-transaction-processor/errors'
import { ChannelAccountsTransactionSubmitterErrorCodes } from 'stellar-plus/core/transaction-submitter/classic/channel-accounts-submitter/errors'
import { DefaultTransactionSubmitterErrorCodes } from 'stellar-plus/core/transaction-submitter/classic/default/errors'
import { ValidationCloudRpcHandlerErrorCodes } from 'stellar-plus/rpc/validation-cloud-handler/errors'

import { AxiosErrorInfo } from './helpers/axios'
import { SubmitTransactionMetaInfo, TransactionDiagnostic } from './helpers/horizon'
import { GetTransactionErrorInfo, SendTransactionErrorInfo, SimulationErrorInfo } from './helpers/soroban-rpc'
import { TransactionData, TransactionInvocationMeta } from './helpers/transaction'
import { CustomAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/custom/errors'

export type StellarPlusErrorObject = {
  code: ErrorCodes
  message: string
  source: string
  diagnostic?: TransactionDiagnostic
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
  | ValidationCloudRpcHandlerErrorCodes
  | DefaultTransactionSubmitterErrorCodes
  | ClassicTransactionProcessorErrorCodes
  | SorobanTransactionProcessorErrorCodes
  | ChannelAccountsTransactionSubmitterErrorCodes
  | CustomAccountHandlerErrorCodes

export enum GeneralErrorCodes {
  ER000 = 'ER000',
}

export type Meta = {
  error?: Error
  data?: object
  message?: string
  transactionXDR?: string
  axiosError?: AxiosErrorInfo
  transactionData?: TransactionData
  sorobanSimulationData?: SimulationErrorInfo
  transactionInvocation?: TransactionInvocationMeta
  sorobanGetTransactionData?: GetTransactionErrorInfo
  sorobanSendTransactionData?: SendTransactionErrorInfo
  horizonSubmitTransactionData?: SubmitTransactionMetaInfo
}
