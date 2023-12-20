import { SorobanDataBuilder, SorobanRpc, xdr } from '@stellar/stellar-sdk'

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
