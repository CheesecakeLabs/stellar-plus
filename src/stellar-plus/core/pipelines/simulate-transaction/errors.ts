import { SorobanRpc } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { SimulateTransactionPipelineInput } from './types'

export enum ErrorCodesPipelineSimulateTransaction {
  // PSI0 General
  PSI001 = 'PSI001',
  PSI002 = 'PSI002',
  PSI003 = 'PSI003',
  PSI004 = 'PSI004',

  //PSI1 Restore
  PSI100 = 'PSI100',
}

const failedToSimulateTransaction = (
  error: Error | StellarPlusError,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSimulateTransaction.PSI001,
    message: 'Failed to simulate!',
    source: 'PipelineSimulateTransaction',
    details: 'An issue occurred while simulating the transaction. Refer to the meta section for more details.',
    meta: {
      error,
      conveyorBeltErrorMeta,
    },
  })
}

const simulationFailed = (
  failedSimulation: SorobanRpc.Api.SimulateTransactionErrorResponse,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSimulateTransaction.PSI002,
    message: 'Failed to simulate!',
    source: 'PipelineSimulateTransaction',
    details: `The simulated transaction status is not success. This indicates the transaction won't succeed if processed by the network. Refer to the meta section for more details and review the transaction parameters.`,
    meta: {
      message: failedSimulation.error,
      conveyorBeltErrorMeta,
      sorobanSimulationData: failedSimulation,
    },
  })
}

const simulationMissingResult = (
  simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSimulateTransaction.PSI003,
    message: 'Simulation missing result!',
    source: 'PipelineSimulateTransaction',
    details: `The simulated transaction status is success but the result is missing. Refer to the meta section for more details and review the transaction parameters.`,
    meta: {
      conveyorBeltErrorMeta,
      sorobanSimulationData: simulationResponse,
    },
  })
}

const simulationResultCouldNotBeVerified = (
  simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSimulateTransaction.PSI004,
    message: 'Simulation result could not be verified!',
    source: 'PipelineSimulateTransaction',
    details: `The simulated transaction status is success but the result could not be verified. Refer to the meta section for more details and review the transaction parameters.`,
    meta: {
      conveyorBeltErrorMeta,
      sorobanSimulationData: simulationResponse,
    },
  })
}

const transactionNeedsRestore = (
  simulationResponse: SorobanRpc.Api.SimulateTransactionRestoreResponse,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineSimulateTransaction.PSI100,
    message: 'Transaction needs restore!',
    source: 'PipelineSimulateTransaction',
    details: `The simulated transaction status is restore. This indicates the transaction needs to be restored. Refer to the meta section for more details and review the transaction parameter.`,

    meta: {
      conveyorBeltErrorMeta,
      sorobanSimulationData: simulationResponse,
    },
  })
}

export const PSIError = {
  failedToSimulateTransaction,
  simulationFailed,
  transactionNeedsRestore,
  simulationMissingResult,
  simulationResultCouldNotBeVerified,
}
