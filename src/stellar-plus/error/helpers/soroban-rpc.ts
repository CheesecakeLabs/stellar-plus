import { SorobanDataBuilder, rpc as SorobanRpc, xdr } from '@stellar/stellar-sdk'

import { extractSorobanResultXdrOpErrorCode } from './result-meta-xdr'

// ====================================================================================================================
// SimulationErrorInfo
// ====================================================================================================================
export type SimulationErrorInfo = errorBase | errorData | restoreData

export type errorBase = {
  id: string
  latestLedger: number
  events: xdr.DiagnosticEvent[]
}

export type errorData = errorBase & {
  error: string
}

export type restoreData = errorBase & {
  result: SorobanRpc.Api.SimulateHostFunctionResult
  restorePreamble: {
    minResourceFee: string
    transactionData: SorobanDataBuilder
  }
}

export const extractSimulationErrorData = (simulation: SorobanRpc.Api.SimulateTransactionErrorResponse): errorData => {
  return {
    ...extractSimulationBaseData(simulation),
    error: simulation.error,
  }
}

export const extractSimulationRestoreData = (
  simulation: SorobanRpc.Api.SimulateTransactionRestoreResponse
): restoreData => {
  return {
    ...extractSimulationBaseData(simulation),
    result: simulation.result,
    restorePreamble: simulation.restorePreamble,
  }
}

export const extractSimulationBaseData = (simulation: SorobanRpc.Api.SimulateTransactionResponse): errorBase => {
  return {
    id: simulation.id,
    latestLedger: simulation.latestLedger,
    events: simulation.events,
  }
}

// ====================================================================================================================
// Send Transaction Error Info
// ====================================================================================================================

export type SendTransactionErrorInfo = BaseSendTransactionResponse | SendTransactionFailed

type SendTransactionFailed = BaseSendTransactionResponse & {
  errorResultXdr?: string
  opErrorCode?: string
}

type BaseSendTransactionResponse = {
  status: SorobanRpc.Api.SendTransactionStatus
  hash: string
  latestLedger: number
  latestLedgerCloseTime: number
}

export const extractSendTransactionErrorData = (
  response: SorobanRpc.Api.SendTransactionResponse | SorobanRpc.Api.RawSendTransactionResponse
): SendTransactionErrorInfo => {
  if (response.status === 'ERROR') {
    const errorResultXdrObject = (response as SorobanRpc.Api.SendTransactionResponse)
      .errorResult as xdr.TransactionResult
    const errorResultXdr = errorResultXdrObject.toXDR('base64')

    return {
      ...response,
      errorResultXdr,
      opErrorCode: extractSorobanResultXdrOpErrorCode(errorResultXdrObject),
    } as SendTransactionFailed
  }

  return {
    ...response,
  } as BaseSendTransactionResponse
}

// ====================================================================================================================
// Get Transaction Error Info
// ====================================================================================================================

export type GetTransactionErrorInfo = GetTransactionBase | GetTransactionFailedErrorInfo

type GetTransactionBase = {
  status: SorobanRpc.Api.GetTransactionStatus
  latestLedger: number
  latestLedgerCloseTime: number
  oldestLedger: number
  oldestLedgerCloseTime: number
}

export type GetTransactionFailedErrorInfo = GetTransactionBase & {
  status: SorobanRpc.Api.GetTransactionStatus.FAILED
  opCode?: string
  ledger: number
  createdAt: number
  applicationOrder: number
  feeBump: boolean
  envelopeXdr: xdr.TransactionEnvelope
  resultXdr: xdr.TransactionResult
  resultMetaXdr: xdr.TransactionMeta
}

export type GetTransactionSuccessErrorInfo = GetTransactionBase & {
  status: SorobanRpc.Api.GetTransactionStatus.SUCCESS
  opCode?: string
  ledger: number
  createdAt: number
  applicationOrder: number
  feeBump: boolean
  envelopeXdr: xdr.TransactionEnvelope
  resultXdr: xdr.TransactionResult
  resultMetaXdr: xdr.TransactionMeta
  returnValue?: xdr.ScVal
}

export const extractGetTransactionData = (
  response:
    | SorobanRpc.Api.GetFailedTransactionResponse
    | SorobanRpc.Api.GetTransactionResponse
    | SorobanRpc.Api.SendTransactionResponse
): GetTransactionErrorInfo => {
  if (response.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    return {
      opCode: extractSorobanResultXdrOpErrorCode(response.resultXdr),
      ...response,
    } as GetTransactionFailedErrorInfo
  }

  if (response.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    return {
      opCode: extractSorobanResultXdrOpErrorCode(response.resultXdr),
      ...response,
    } as GetTransactionSuccessErrorInfo
  }

  return {
    ...response,
  } as GetTransactionBase
}
