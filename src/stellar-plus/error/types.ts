import { DefaultAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/default/errors'
import { FreighterAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/freighter/errors'
import { FriendbotErrorCodes } from 'stellar-plus/account/helpers/friendbot/errors'
import { ClassicAssetHandlerErrorCodes } from 'stellar-plus/asset/classic/errors'
import { ChannelAccountsErrorCodes } from 'stellar-plus/channel-accounts/errors'
import { ContractEngineErrorCodes } from 'stellar-plus/core/contract-engine/errors'
import { ErrorCodesPipelineBuildTransaction } from 'stellar-plus/core/pipelines/build-transaction/errors'
import { ErrorCodesPipelineClassicSignRequirements } from 'stellar-plus/core/pipelines/classic-sign-requirements/errors'
import { ErrorCodesPipelineFeeBump } from 'stellar-plus/core/pipelines/fee-bump/errors'
import { ErrorCodesPipelineSignTransaction } from 'stellar-plus/core/pipelines/sign-transaction/errors'
import { ErrorCodesPipelineSimulateTransaction } from 'stellar-plus/core/pipelines/simulate-transaction/errors'
import { ErrorCodesPipelineSorobanAuth } from 'stellar-plus/core/pipelines/soroban-auth/errors'
import { ErrorCodesPipelineSorobanGetTransaction } from 'stellar-plus/core/pipelines/soroban-get-transaction/errors'
import { ErrorCodesPipelineSubmitTransaction } from 'stellar-plus/core/pipelines/submit-transaction/errors'
import { ValidationCloudRpcHandlerErrorCodes } from 'stellar-plus/rpc/validation-cloud-handler/errors'

import { AxiosErrorInfo } from './helpers/axios'
import { SubmitTransactionMetaInfo, TransactionDiagnostic } from './helpers/horizon'
import { GetTransactionErrorInfo, SendTransactionErrorInfo, SimulationErrorInfo } from './helpers/soroban-rpc'
import { TransactionData, TransactionInvocationMeta } from './helpers/transaction'

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
  | ErrorCodesPipelineFeeBump
  | ClassicAssetHandlerErrorCodes
  | ErrorCodesPipelineSorobanAuth
  | DefaultAccountHandlerErrorCodes
  | ErrorCodesPipelineSignTransaction
  | FreighterAccountHandlerErrorCodes
  | ValidationCloudRpcHandlerErrorCodes
  | ErrorCodesPipelineBuildTransaction
  | ErrorCodesPipelineSubmitTransaction
  | ErrorCodesPipelineSimulateTransaction
  | ErrorCodesPipelineSorobanGetTransaction
  | ErrorCodesPipelineClassicSignRequirements

export enum GeneralErrorCodes {
  ER000 = 'ER000',
}

export type Meta = {
  error?: Error | StellarPlusErrorObject
  data?: object
  message?: string
  transactionXDR?: string
  transactionHash?: string
  axiosError?: AxiosErrorInfo
  transactionData?: TransactionData
  sorobanSimulationData?: SimulationErrorInfo
  transactionInvocation?: TransactionInvocationMeta
  sorobanGetTransactionData?: GetTransactionErrorInfo
  sorobanSendTransactionData?: SendTransactionErrorInfo
  horizonSubmitTransactionData?: SubmitTransactionMetaInfo
  conveyorBeltErrorMeta?: unknown
}
