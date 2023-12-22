import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'
import { AxiosError } from 'axios'

import { extractAxiosErrorInfo } from './axios'
import { operationErrorMessages, operationSpecificErrorMessages, transactionErrorMessages } from './horizon-error-codes'
import { OperationData, extractOperationsData, extractTransactionData } from './transaction'
import { Meta } from '../types'
export const extractDataFromSubmitTransactionError = (
  response: HorizonApi.SubmitTransactionResponse
): SubmitTransactionMetaInfo => {
  return {
    ...response,
  } as SubmitTransactionMetaInfo
}

export type SubmitTransactionMetaInfo = {
  hash: string
  ledger: number
  successful: boolean
  envelope_xdr: string
  result_xdr: string
  result_meta_xdr: string
  paging_token: string
}

export type HorizonDiagnostics = {
  diagnostic?: TransactionDiagnostic
  meta?: Meta
}

export const diagnoseSubmitError = (
  error: Error | AxiosError,
  tx?: Transaction | FeeBumpTransaction
): HorizonDiagnostics => {
  const transactionData = tx ? extractTransactionData(tx) : undefined

  if (error instanceof AxiosError) {
    const axiosError = extractAxiosErrorInfo(error)

    if (axiosError.data && isHorizonErrorResponseData(axiosError.data)) {
      const horizonError = axiosError.data as HorizonApi.ErrorResponseData
      const diagnostic =
        horizonError.status === 400 // Failed transaction, contains error codes
          ? reviewTransactionError(horizonError as HorizonApi.ErrorResponseData.TransactionFailed, tx)
          : undefined

      return {
        // Horizon Error
        diagnostic,
        meta: {
          transactionData,
          data: axiosError.data as HorizonApi.ErrorResponseData,
        },
      } as HorizonDiagnostics
    }

    return {
      // Axios Error
      meta: {
        message: axiosError.message,
        transactionData,
        data: axiosError.data as HorizonApi.ErrorResponseData,
      },
    }
  }
  return {
    // Generic Error
    meta: { error, transactionData },
  }
}

const isHorizonErrorResponseData = (data: unknown): boolean => {
  if (typeof data === 'object' && data !== null) {
    const potentialError = data as HorizonApi.ErrorResponseData.Base // Type assertion
    return (
      'status' in potentialError && 'title' in potentialError && 'type' in potentialError && 'detail' in potentialError
    )
  }
  return false
}

export type TransactionDiagnostic = {
  transaction?: DiagnosticEntry
  operations?: DiagnosticEntry[]
}

export type DiagnosticEntry = {
  issue?: string
  suggestion?: string
  operation?: string
  code?: string
}

const reviewTransactionError = (
  errorData: HorizonApi.ErrorResponseData.TransactionFailed,
  tx?: Transaction | FeeBumpTransaction
): TransactionDiagnostic => {
  const diagnostic: TransactionDiagnostic = {}

  if (errorData.extras && errorData.extras.result_codes) {
    const codes = errorData.extras.result_codes

    // Transaction level errors
    if (codes.transaction) {
      diagnostic.transaction = {
        code: codes.transaction,
        ...{
          issue: 'Unknown transaction error',
          suggestion: 'No suggestion available',
        },
        ...transactionErrorMessages[codes.transaction],
      }
    }

    // Operation specific errors
    if (codes.operations && codes.operations.length > 0) {
      const envelope = tx && tx instanceof FeeBumpTransaction ? tx.innerTransaction : tx

      const operationDetails = envelope ? extractOperationsData(envelope.operations, false) : []

      diagnostic.operations = codes.operations.map((opCode, index) => {
        const operation = (operationDetails[index] as OperationData).type as string

        const opDiagnostic = {
          code: opCode,
          ...{
            issue: `Unknown operation error: ${opCode}`,
            suggestion: 'No suggestion available',
          },
          ...operationErrorMessages[opCode],
          ...operationSpecificErrorMessages[operation]?.[opCode],
        }

        return {
          operation: operation || undefined,
          ...opDiagnostic,
        }
      })
    }
  }

  return diagnostic
}
