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

  // CE1 Simulation
  CE100 = 'CE100',
  CE101 = 'CE101',
  CE102 = 'CE102',
  CE103 = 'CE103',
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

const simulationFailed = (simulation: SorobanRpc.Api.SimulateTransactionResponse): StellarPlusError => {
  if (SorobanRpc.Api.isSimulationError(simulation)) {
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
  if (SorobanRpc.Api.isSimulationRestore(simulation)) {
    return new StellarPlusError({
      code: ContractEngineErrorCodes.CE102,
      message: 'Transaction simulation failed!',
      source: 'ContractEngine',
      details:
        'Transaction simulation failed! The transaction simulation returned a restore status. This usually indicates the contract instance or the storage data has reached its limit. Review the meta data for further information about this error. It might be possible to restore the contract state by extending the contract instance or the storage data TTL.',
      meta: { sorobanSimulationData: extractSimulationRestoreData(simulation), data: { simulation } },
    })
  }

  if (SorobanRpc.Api.isSimulationSuccess(simulation) && !simulation.result) {
    return new StellarPlusError({
      code: ContractEngineErrorCodes.CE103,
      message: 'Transaction simulation is missing the result data!',
      source: 'ContractEngine',
      details:
        'Transaction simulation is missing the result data! The transaction simulation returned a success status, but the result data is missing. Review the simulated transaction parameters for further for troubleshooting.',
      meta: { data: { simulation } },
    })
  }

  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE100,
    message: 'Unexpected error in transaction simulation!',
    source: 'ContractEngine',
    details:
      'Unexpected error in transaction simulation! The transaction simulation returned an unexpected status. Review the meta data for further information about this error.',
    meta: { sorobanSimulationData: extractSimulationBaseData(simulation), data: { simulation } },
  })
}

export const CEError = {
  missingContractId,
  missingWasm,
  missingWasmHash,
  simulationFailed,
}
