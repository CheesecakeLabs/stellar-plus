import { rpc as SorobanRpc } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { extractGetTransactionData } from 'stellar-plus/error/helpers/soroban-rpc'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { SorobanGetTransactionPipelineInput } from './types'

export enum ErrorCodesPipelineSorobanGetTransaction {
  //General
  SGT001 = 'SGT001',
  SGT002 = 'SGT002',
}

const transactionFailed = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanGetTransactionPipelineInput, BeltMetadata>,
  response: SorobanRpc.Api.GetFailedTransactionResponse
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanGetTransaction.SGT001,
    message: 'The transaction failed!',
    source: 'PipelineSorobanGetTransaction',
    details:
      'The transaction was submitted to the network but failed to be processed. This indicates an issue with the transaction that makes it invalid. Please check the details of the transaction and try again.',
    meta: {
      conveyorBeltErrorMeta,
      sorobanGetTransactionData: extractGetTransactionData(response),
    },
  })
}

const transactionNotFound = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanGetTransactionPipelineInput, BeltMetadata>,
  timeout: number,
  hash: string
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanGetTransaction.SGT002,
    message: 'Transaction not found!',
    source: 'PipelineSorobanGetTransaction',
    details: `The transaction was not found in the Soroban server. This indicates that the transaction was not fully processed when the timeout(${timeout}s) was reachead.`,
    meta: {
      conveyorBeltErrorMeta,
      transactionHash: hash,
    },
  })
}

export const SGTError = {
  transactionFailed,
  transactionNotFound,
}
