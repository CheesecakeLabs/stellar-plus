import { DefaultAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/default/errors'
import { FreighterAccountHandlerErrorCodes } from 'stellar-plus/account/account-handler/freighter/errors'
import { AccountBaseErrorCodes } from 'stellar-plus/account/base/errors'
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
import { AxiosErrorInfo } from 'stellar-plus/error/helpers/axios'
import { SubmitTransactionMetaInfo, TransactionDiagnostic } from 'stellar-plus/error/helpers/horizon'
import {
  GetTransactionErrorInfo,
  SendTransactionErrorInfo,
  SimulationErrorInfo,
} from 'stellar-plus/error/helpers/soroban-rpc'
import { TransactionData, TransactionInvocationMeta } from 'stellar-plus/error/helpers/transaction'
import { DefaultHorizonHandlerErrorCodes } from 'stellar-plus/horizon/errors'
import { DefaultRpcHandlerErrorCodes } from 'stellar-plus/rpc/default-handler/errors'
import { ValidationCloudRpcHandlerErrorCodes } from 'stellar-plus/rpc/validation-cloud-handler/errors'

export type StellarPlusErrorObject = {
  code: ErrorCodes
  message: string
  source: string
  diagnostic?: TransactionDiagnostic
  details?: string
  meta?: Meta
}

export type ErrorCodes =
  | GeneralErrorCodes
  | AccountBaseErrorCodes
  | ContractEngineErrorCodes
  | ChannelAccountsErrorCodes
  | ErrorCodesPipelineFeeBump
  | DefaultRpcHandlerErrorCodes
  | ClassicAssetHandlerErrorCodes
  | ErrorCodesPipelineSorobanAuth
  | DefaultAccountHandlerErrorCodes
  | DefaultHorizonHandlerErrorCodes
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
