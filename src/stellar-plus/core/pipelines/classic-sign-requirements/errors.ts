import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { extractTransactionData } from 'stellar-plus/error/helpers/transaction'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { ClassicSignRequirementsPipelineInput } from './types'

export enum ErrorCodesPipelineClassicSignRequirements {
  // PBT0 General
  CSR001 = 'CSR001',
}

const processFailed = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<ClassicSignRequirementsPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineClassicSignRequirements.CSR001,
    message: 'An issue occurred while processing the classic sign requirements.',
    source: 'PipelineClassicSignRequirements',
    details:
      "An issue occurred while processing the classic sign requirements. Review the transaction object and the operations' parameters.",
    meta: {
      error,
      conveyorBeltErrorMeta,
      transactionData: extractTransactionData(transaction),
    },
  })
}

export const CSRError = {
  processFailed,
}
