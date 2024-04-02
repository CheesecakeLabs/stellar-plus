import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { extractTransactionData } from 'stellar-plus/error/helpers/transaction'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { SignTransactionPipelineInput } from './types'

export enum ErrorCodesPipelineSignTransaction {
  // PSIG0 General
  PSIG001 = 'PSIG001',
  PSIG002 = 'PSIG002',
  PSIG003 = 'PSIG003',
  PSIG004 = 'PSIG004',
}

const noRequirementsProvided = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SignTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSignTransaction.PSIG001,
    message: 'No signature requirements provided!',
    source: 'PipelineSignTransaction',
    details: `No signature requirements provided for the transaction. It is possible to use the classicSignRequirements pipeline to automatically identify Stellar Classic signature requirements for a given transaction.`,
    meta: {
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}
const noSignersProvided = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SignTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSignTransaction.PSIG002,
    message: 'No signers provided!',
    source: 'PipelineSignTransaction',
    details: `No signers provided. Review your transaction workflow to ensure the proper signers are being provided for the transaction.`,
    meta: {
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

const signerNotFound = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SignTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction,
  missingSigner: string,
  signers: string[]
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSignTransaction.PSIG003,
    message: 'The signer was not found!',
    source: 'PipelineSignTransaction',
    details: `The required signer was not found in the provided signers list. The missing signer is: ${missingSigner}. `,
    meta: {
      data: {
        signers,
      },
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

const couldntSignTransaction = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SignTransactionPipelineInput, BeltMetadata>,
  transaction: Transaction | FeeBumpTransaction,
  signerPublicKey: string
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSignTransaction.PSIG004,
    message: 'Failed to sign transaction!',
    source: 'PipelineSignTransaction',
    details: `An issue occurred while signing the transaction with the signer: ${signerPublicKey}.`,
    meta: {
      error,
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

export const PSIGError = {
  noRequirementsProvided,
  noSignersProvided,
  signerNotFound,
  couldntSignTransaction,
}
