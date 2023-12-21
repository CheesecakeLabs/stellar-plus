import { SorobanDataBuilder, SorobanRpc, xdr } from '@stellar/stellar-sdk'

// ====================================================================================================================
// SimulationErrorInfo
// ====================================================================================================================
export type SimulationErrorInfo = errorBase | errorData | restoreData

type errorBase = {
  id: string
  latestLedger: number
  events: xdr.DiagnosticEvent[]
}

type errorData = errorBase & {
  error: string
}

type restoreData = errorBase & {
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
    return {
      ...response,
      errorResultXdr: (response as SorobanRpc.Api.SendTransactionResponse).errorResult?.toXDR('base64'),
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

type GetTransactionFailedErrorInfo = GetTransactionBase & {
  ledger: number
  createdAt: number
  applicationOrder: number
  feeBump: boolean
  envelopeXdr: xdr.TransactionEnvelope
  resultXdr: xdr.TransactionResult
  resultMetaXdr: xdr.TransactionMeta
}

export const extractGetTransactionData = (
  response:
    | SorobanRpc.Api.GetFailedTransactionResponse
    | SorobanRpc.Api.GetTransactionResponse
    | SorobanRpc.Api.SendTransactionResponse
): GetTransactionErrorInfo => {
  if (response.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    return {
      ...response,
    } as GetTransactionFailedErrorInfo
  }

  return {
    ...response,
  } as GetTransactionBase
}
