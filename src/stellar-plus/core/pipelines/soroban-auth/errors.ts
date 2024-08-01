import { Transaction, xdr } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { extractTransactionData } from 'stellar-plus/error/helpers/transaction'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { SorobanAuthPipelineInput } from './types'

export enum ErrorCodesPipelineSorobanAuth {
  // PSA0 General
  PSA001 = 'PSA001',
  PSA002 = 'PSA002',
  PSA003 = 'PSA003',
  PSA004 = 'PSA004',
}

const signerNotFound = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>,
  transaction: Transaction,
  signers: string[],
  authEntryRequiredSigner: string,
  authEntry: xdr.SorobanAuthorizationEntry
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanAuth.PSA001,
    message: 'The signer was not found!',
    source: 'PipelineSorobanAuth',
    details: `The required signer was not found in the provided signers list. The missing signer is: ${authEntryRequiredSigner}. `,
    meta: {
      data: { signers, authEntryRequiredSigner, authEntry: authEntry.toXDR('base64') },
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

const noSignersProvided = (
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanAuth.PSA002,
    message: 'No signers provided!',
    source: 'PipelineSorobanAuth',
    details: `No signers provided. Review your transaction workflow to ensure the proper signers are being provided for the transaction.`,
    meta: {
      conveyorBeltErrorMeta,
    },
  })
}

const couldntUpdateTransaction = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>,
  transaction: Transaction,
  signedAuthEntries: xdr.SorobanAuthorizationEntry[]
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanAuth.PSA003,
    message: 'Could not update transaction!',
    source: 'PipelineSorobanAuth',
    details: `The transaction could not be updated with the signed authorization entries. The error '${error.message}' was caught.Review the details of the transaction and the provided signers.`,
    meta: {
      error,
      data: { signedAuthEntries: signedAuthEntries.map((s) => s.toXDR('base64')) },
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

const couldntSimulateAuthorizedTransaction = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>,
  transaction: Transaction,
  signedAuthEntries: xdr.SorobanAuthorizationEntry[]
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanAuth.PSA003,
    message: 'Could not simulate transaction with signed soroban entries!',
    source: 'PipelineSorobanAuth',
    details: `The transaction was updated with the signed authorization entries, but the simulation failed. The error '${error.message}' was caught.Review the details of the transaction and the provided signers.`,
    meta: {
      error,
      data: { signedAuthEntries: signedAuthEntries.map((s) => s.toXDR('base64')) },
      transactionData: extractTransactionData(transaction),
      conveyorBeltErrorMeta,
    },
  })
}

const contractAuthNotSupported = (
  contractId: string,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSorobanAuth.PSA004,
    message: 'Contract authorization not supported!',
    source: 'PipelineSorobanAuth',
    details: `Contract authorization is not supported in the current version of Stellar Plus. This contract function is verifying against a specific contract authorization from (${contractId}) which is likely expected to be accessed as a sub-invocation instead of root invocation.`,
    meta: {
      conveyorBeltErrorMeta,
    },
  })
}

export const PSAError = {
  signerNotFound,
  noSignersProvided,
  couldntUpdateTransaction,
  couldntSimulateAuthorizedTransaction,
  contractAuthNotSupported,
}
