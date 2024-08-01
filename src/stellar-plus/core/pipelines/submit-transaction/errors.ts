import { Horizon } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { diagnoseSubmitError, extractDataFromSubmitTransactionError } from 'stellar-plus/error/helpers/horizon'
import { extractTransactionData } from 'stellar-plus/error/helpers/transaction'
import { FeeBumpTransaction, Transaction } from 'stellar-plus/types'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { SubmitTransactionPipelineInput } from './types'

export enum ErrorCodesPipelineSubmitTransaction {
  // PSU001 General
  PSU001 = 'PSU001',
  // PSU101 Horizon
  PSU101 = 'PSU101',
  PSU102 = 'PSU102',
  // PSU201 RPC,
  PSU201 = 'PSU201',
}

const invalidNetworkHandler = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SubmitTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSubmitTransaction.PSU001,
    message: 'Invalid network handler!',
    source: 'PipelineSubmitTransaction',
    details: 'The network handler provided is invalid. It must be either a HorizonHandler or an RpcHandler.',
    meta: {
      conveyorBeltErrorMeta,
    },
  })
}

const horizonSubmissionFailed = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SubmitTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  const { diagnostic, meta } = diagnoseSubmitError(error, transaction)

  return new StellarPlusError({
    code: ErrorCodesPipelineSubmitTransaction.PSU101,
    message: 'Transaction submission through Horizon failed!',
    source: 'PipelineSubmitTransaction',
    details:
      'An issue occurred while submitting the transaction through Horizon. Review the meta section for more details.',
    diagnostic: diagnostic,
    meta: {
      ...meta,
      conveyorBeltErrorMeta,
    },
  })
}
const transactionSubmittedThroughHorizonFailed = (
  response: Horizon.HorizonApi.SubmitTransactionResponse,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SubmitTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  const { diagnostic, meta } = diagnoseSubmitError(new Error('Transaction Failed!'), transaction)

  return new StellarPlusError({
    code: ErrorCodesPipelineSubmitTransaction.PSU102,
    message: 'The transaction submitted through Horizon has failed!',
    source: 'PipelineSubmitTransaction',
    details:
      "The transaction couldn't be processed by the network. This indicates that the transaction was submitted successfully, but it failed during processing due to some inconsistency or invalid paramter. Review the meta section for more details.",
    diagnostic: diagnostic,
    meta: {
      ...meta,
      horizonSubmitTransactionData: extractDataFromSubmitTransactionError(response),

      conveyorBeltErrorMeta,
      data: { response },
    },
  })
}

const rpcSubmissionFailed = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SubmitTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSubmitTransaction.PSU201,
    message: 'Transaction submission through Soroban RPC failed!',
    source: 'PipelineSubmitTransaction',
    details:
      'An issue occurred while submitting the transaction through the Soroban RPC. Review the meta section for more details.',

    meta: {
      message: error.message,
      transactionData: extractTransactionData(transaction),
      error,
      conveyorBeltErrorMeta,
    },
  })
}

export const PSUError = {
  invalidNetworkHandler,
  horizonSubmissionFailed,
  transactionSubmittedThroughHorizonFailed,
  rpcSubmissionFailed,
}
