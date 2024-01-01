import { SorobanRpc } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import {
  extractSimulationBaseData,
  extractSimulationErrorData,
  extractSimulationRestoreData,
} from 'stellar-plus/error/helpers/soroban-rpc'

export enum ContractEngineErrorCodes {
  // CE0 General
  CE001 = 'CE001',
  CE002 = 'CE002',
  CE003 = 'CE003',
  CE004 = 'CE004',

  // CE1 Simulation
  CE100 = 'CE100',
  CE101 = 'CE101',
  CE102 = 'CE102',
  CE103 = 'CE103',

  // CE2 Meta
  CE200 = 'CE200',
  CE201 = 'CE201',
  CE202 = 'CE202',
  CE203 = 'CE203',
}

const missingContractId = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE001,
    message: 'Missing contract ID!',
    source: 'ContractEngine',
    details:
      "Missing contract ID! This function requires a contract Id to be defined in this instance. You can either initialize the contract engine with a contract ID or use the 'deploy' function to deploy a new instance of the contract, which will automatically set the new contract Id for this instance.",
  })
}

const missingWasm = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE002,
    message: 'Missing wasm!',
    source: 'ContractEngine',
    details:
      'Missing wasm! This function requires a buffer of the wasm file to be defined in this instance. You need to initialize the contract engine with a wasm file buffer.',
  })
}

const missingWasmHash = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE003,
    message: 'Missing wasm hash!',
    source: 'ContractEngine',
    details:
      "Missing wasm hash! This function requires a wasm hash to be defined in this instance. You can either initialize the contract engine with a wasm hash or use the 'uploadWasm' function to upload a new wasm file, which will automatically set the new wasm hash for this instance.",
  })
}

const contractIdAlreadySet = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE004,
    message: 'Contract ID already set!',
    source: 'ContractEngine',
    details:
      'Contract ID already set! This function requires a contract Id to be defined in this instance. You can initialize the contract engine with a contract ID or use the "deploy" function to deploy a new instance of the contract, or user the wrapAndDeployClassicAsset to wrap a classic asset with the Stellar Asset Contract.',
  })
}

const simulationFailed = (simulation: SorobanRpc.Api.SimulateTransactionErrorResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE101,
    message: 'Transaction simulation failed!',
    source: 'ContractEngine',
    details:
      'Transaction simulation failed! The transaction simulation returned a failure status. Review the meta data for further information about this error.',
    meta: {
      sorobanSimulationData: extractSimulationErrorData(simulation),
      data: { simulation },
    },
  })
}

const simulationMissingResult = (simulation: SorobanRpc.Api.SimulateTransactionSuccessResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE103,
    message: 'Transaction simulation is missing the result data!',
    source: 'ContractEngine',
    details:
      'Transaction simulation is missing the result data! The transaction simulation returned a success status, but the result data is missing. Review the simulated transaction parameters for further for troubleshooting.',
    meta: { data: { simulation } },
  })
}

const transactionNeedsRestore = (simulation: SorobanRpc.Api.SimulateTransactionRestoreResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE102,
    message: 'A footprint restore is required!',
    source: 'ContractEngine',
    details:
      'The transaction simulation returned a restore status. This usually indicates the contract instance or the storage data has reached its limit. Review the meta data for further information about this error. It might be possible to restore the contract state by extending the contract instance or the storage data TTL.',
    meta: { sorobanSimulationData: extractSimulationRestoreData(simulation), data: { simulation } },
  })
}

const couldntVerifyTransactionSimulation = (
  simulation: SorobanRpc.Api.SimulateTransactionResponse
): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE100,
    message: 'Unexpected error in transaction simulation!',
    source: 'ContractEngine',
    details:
      'Unexpected error in transaction simulation! The transaction simulation returned an unexpected status. Review the meta data for further information about this error.',
    meta: { sorobanSimulationData: extractSimulationBaseData(simulation), data: { simulation } },
  })
}

const restoreOptionNotSet = (simulation: SorobanRpc.Api.SimulateTransactionRestoreResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE200,
    message: 'Restore option not set!',
    source: 'ContractEngine',
    details:
      'Restore option not set! This function requires a restore option to be defined in this instance. You can either initialize the contract engine with a restore option or use the "restore" function to restore the contract state from a previous transaction.',
    meta: { sorobanSimulationData: extractSimulationRestoreData(simulation), data: { simulation } },
  })
}

const failedToUploadWasm = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE201,
    message: 'Failed to upload wasm!',
    source: 'SorobanTransactionProcessor',
    details:
      'The wasm file could not be uploaded. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, error: error },
  })
}

const failedToDeployContract = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE202,
    message: 'Failed to deploy contract!',
    source: 'SorobanTransactionProcessor',
    details:
      'The contract could not be deployed. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

const failedToWrapAsset = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE203,
    message: 'Failed to wrap asset!',
    source: 'SorobanTransactionProcessor',
    details: 'The asset could not be wrapped. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

export const CEError = {
  missingContractId,
  missingWasm,
  missingWasmHash,
  couldntVerifyTransactionSimulation,
  simulationFailed,
  contractIdAlreadySet,
  transactionNeedsRestore,
  simulationMissingResult,
  restoreOptionNotSet,
  failedToUploadWasm,
  failedToDeployContract,
  failedToWrapAsset,
}
