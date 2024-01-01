import { FeeBumpTransaction, SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { SorobanOpCodes } from 'stellar-plus/error/helpers/result-meta-xdr'
import {
  GetTransactionFailedErrorInfo,
  extractGetTransactionData,
  extractSendTransactionErrorData,
  extractSimulationBaseData,
} from 'stellar-plus/error/helpers/soroban-rpc'
import { extractTransactionData, extractTransactionInvocationMeta } from 'stellar-plus/error/helpers/transaction'

import { EnvelopeHeader } from '../types'

export enum SorobanTransactionProcessorErrorCodes {
  // STP0 General
  STP001 = 'STP001',
  STP002 = 'STP002',
  STP003 = 'STP003',
  STP004 = 'STP004',
  STP005 = 'STP005',
  STP006 = 'STP006',
  STP007 = 'STP007',
  STP008 = 'STP008',
  STP009 = 'STP009',
  STP010 = 'STP010',

  // STP1 Transaction Operation Error codes
  STP100 = 'STP100',
  STP101 = 'STP101',
}

const failedToBuildTransaction = (error: Error, header: EnvelopeHeader): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP001,
    message: 'Failed to build transaction!',
    source: 'SorobanTransactionProcessor',
    details:
      'Failed to build transaction! The transaction could not be built. Make sure that the transaction is valid and that the account has been initialized correctly.',
    meta: { message: error.message, transactionInvocation: extractTransactionInvocationMeta({ header }, true) },
  })
}

const failedToSimulateTransaction = (error: Error, tx: Transaction | FeeBumpTransaction): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP002,
    message: 'Failed to simulate transaction!',
    source: 'SorobanTransactionProcessor',
    details: 'The transaction could not be simulated. Review the transaction envelope and make sure that it is valid.',
    meta: { message: error.message, transactionData: extractTransactionData(tx), transactionXDR: tx.toXDR(), error },
  })
}

const failedToAssembleTransaction = (
  error: Error,
  tx: Transaction | FeeBumpTransaction,
  simulatedTransaction: SorobanRpc.Api.SimulateTransactionResponse
): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP003,
    message: 'Failed to assemble transaction!',
    source: 'SorobanTransactionProcessor',
    details: 'The transaction could not be assembled. Review the transaction envelope and make sure that it is valid.',
    meta: {
      message: error.message,
      sorobanSimulationData: extractSimulationBaseData(simulatedTransaction),
      transactionData: extractTransactionData(tx),
      transactionXDR: tx.toXDR(),
      error,
    },
  })
}

const failedToSubmitTransaction = (error: Error, tx: Transaction | FeeBumpTransaction): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP004,
    message: 'Failed to submit transaction!',
    source: 'SorobanTransactionProcessor',
    details: 'The transaction could not be submitted. Review the transaction envelope and make sure that it is valid.',
    meta: { message: error.message, transactionData: extractTransactionData(tx), transactionXDR: tx.toXDR(), error },
  })
}

const failedToSubmitTransactionWithResponse = (response: SorobanRpc.Api.SendTransactionResponse): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP004,
    message: 'Submitted transaction failed!',
    source: 'SorobanTransactionProcessor',
    details:
      'The transaction could not be submitted.. Review the transaction envelope and make sure that it is valid. Also review the error message for further information about the failure.',
    meta: { sorobanSendTransactionData: extractSendTransactionErrorData(response) },
  })
}

const failedToVerifyTransactionSubmission = (response: SorobanRpc.Api.SendTransactionResponse): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP005,
    message: 'Submitted transaction could not be verified!',
    source: 'SorobanTransactionProcessor',
    details:
      'The submitted transaction could not be verified after submission. Review the transaction envelope and make sure that it is valid. Also review the error message for further information about the failure.',
    meta: { sorobanSendTransactionData: extractSendTransactionErrorData(response) },
  })
}

const transactionSubmittedFailed = (response: SorobanRpc.Api.GetFailedTransactionResponse): StellarPlusError => {
  const sorobanGetTransactionData = extractGetTransactionData(response)

  if ((sorobanGetTransactionData as GetTransactionFailedErrorInfo).opCode) {
    return verifyOpErrorCode(sorobanGetTransactionData as GetTransactionFailedErrorInfo)
  }

  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP006,
    message: 'Transaction failed!',
    source: 'SorobanTransactionProcessor',
    details: `The transaction submitted failed. Review the transaction envelope and make sure that it is valid. Also review the error message for further information about the failure.`,
    meta: {
      sorobanGetTransactionData: extractGetTransactionData(response),
    },
  })
}

const verifyOpErrorCode = (sorobanGetTransactionData: GetTransactionFailedErrorInfo): StellarPlusError => {
  const opErrorCode = sorobanGetTransactionData.opCode

  if (opErrorCode === SorobanOpCodes.invokeHostFunctionEntryArchived) {
    return new StellarPlusError({
      code: SorobanTransactionProcessorErrorCodes.STP101,
      message: 'Transaction failed! Entry archived!',
      source: 'SorobanTransactionProcessor',
      details: `The transaction submitted failed with operation error code ${opErrorCode} . The entry is archived and needs to be restored. Refer to the Soroban documentation for further information about restoring footpring. `,
      meta: {
        sorobanGetTransactionData,
      },
    })
  }

  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP100,
    message: 'Transaction failed!',
    source: 'SorobanTransactionProcessor',
    details: `The transaction submitted failed. Unknown soroban operation error code: ${opErrorCode} `,
    meta: {
      sorobanGetTransactionData,
    },
  })
}

const transactionSubmittedNotFound = (
  response: SorobanRpc.Api.GetTransactionResponse,
  waitTimeout: number
): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP007,
    message: 'Transaction not found!',
    source: 'SorobanTransactionProcessor',
    details: `The transaction submitted was not found within the waiting period of ${waitTimeout} ms. Althought the transaction was sent for processing, the subsequent attempts to verify the transaction status didn't succeed to locate it. Review the error message for further information about the failure.`,
    meta: { sorobanGetTransactionData: extractGetTransactionData(response) },
  })
}

const failedToUploadWasm = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP008,
    message: 'Failed to upload wasm!',
    source: 'SorobanTransactionProcessor',
    details:
      'The wasm file could not be uploaded. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, error: error },
  })
}

const failedToDeployContract = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP009,
    message: 'Failed to deploy contract!',
    source: 'SorobanTransactionProcessor',
    details:
      'The contract could not be deployed. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

const failedToWrapAsset = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: SorobanTransactionProcessorErrorCodes.STP010,
    message: 'Failed to wrap asset!',
    source: 'SorobanTransactionProcessor',
    details: 'The asset could not be wrapped. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

export const STPError = {
  failedToBuildTransaction,
  failedToSimulateTransaction,
  failedToAssembleTransaction,
  failedToSubmitTransaction,
  failedToSubmitTransactionWithResponse,
  failedToVerifyTransactionSubmission,
  transactionSubmittedFailed,
  transactionSubmittedNotFound,
  failedToUploadWasm,
  failedToDeployContract,
  failedToWrapAsset,
}
