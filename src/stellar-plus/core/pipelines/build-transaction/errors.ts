import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { BuildTransactionPipelineInput } from './types'

export enum ErrorCodesPipelineBuildTransaction {
  // PBT0 General
  PBT001 = 'PBT001',
  PBT002 = 'PBT002',
  PBT003 = 'PBT003',
  PBT004 = 'PBT004',
}

const couldntLoadAccount = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<BuildTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineBuildTransaction.PBT001,
    message: 'Could not load account!',
    source: 'PipelineBuildTransaction',
    details: "An issue occurred while loading the account's data. Refer to the meta section for more details.",
    meta: {
      error,
      conveyorBeltErrorMeta,
    },
  })
}

const couldntCreateTransactionBuilder = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<BuildTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineBuildTransaction.PBT002,
    message: 'Could not create transaction builder!',
    source: 'PipelineBuildTransaction',
    details: 'An issue occurred while creating the transaction builder. Refer to the meta section for more details.',
    meta: {
      error,
      conveyorBeltErrorMeta,
    },
  })
}

const couldntAddOperations = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<BuildTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineBuildTransaction.PBT003,
    message: 'Could not add operations!',
    source: 'PipelineBuildTransaction',
    details:
      'An issue occurred while adding the operations to the transaction builder. Refer to the meta section for more details.',
    meta: {
      error,
      conveyorBeltErrorMeta,
    },
  })
}

const couldntBuildTransaction = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<BuildTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineBuildTransaction.PBT004,
    message: 'Could not build transaction!',
    source: 'PipelineBuildTransaction',
    details: "An issue occurred while building the transaction's envelope. Refer to the meta section for more details.",
    meta: {
      error,
      conveyorBeltErrorMeta,
    },
  })
}

export const PBTError = {
  couldntLoadAccount,
  couldntCreateTransactionBuilder,
  couldntAddOperations,
  couldntBuildTransaction,
}
