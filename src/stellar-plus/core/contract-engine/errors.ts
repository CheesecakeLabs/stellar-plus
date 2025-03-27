import { rpc as SorobanRpc } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'

export enum ContractEngineErrorCodes {
  // CE0 General
  CE001 = 'CE001',
  CE002 = 'CE002',
  CE003 = 'CE003',
  CE004 = 'CE004',
  CE005 = 'CE005',

  // CE1 Meta
  CE101 = 'CE101',
  CE102 = 'CE102',
  CE103 = 'CE103',

  // CE2 Missing parameters
  CE201 = 'CE201',
  CE202 = 'CE202',
  CE203 = 'CE203',
  CE204 = 'CE204',
  CE205 = 'CE205',
}

const contractIdAlreadySet = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE001,
    message: 'Contract ID already set!',
    source: 'ContractEngine',
    details:
      'Contract ID already set! This function requires a contract Id to be defined in this instance. You can initialize the contract engine with a contract ID or use the "deploy" function to deploy a new instance of the contract, or user the wrapAndDeployClassicAsset to wrap a classic asset with the Stellar Asset Contract.',
  })
}

const contractInstanceNotFound = (ledgerEntries: SorobanRpc.Api.GetLedgerEntriesResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE002,
    message: 'Contract instance not found!',
    source: 'ContractEngine',
    details:
      'Contract instance not found! The contract instance could not be found on the Stellar network. Please verify the contract ID and make sure the contract instance has been deployed to the Stellar network.',
    meta: { data: { ledgerEntries } },
  })
}

const contractInstanceMissingLiveUntilLedgerSeq = (
  ledgerEntries?: SorobanRpc.Api.GetLedgerEntriesResponse
): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE003,
    message: 'Contract instance missing live_until_ledger_seq!',
    source: 'ContractEngine',
    details:
      'Contract instance missing live_until_ledger_seq! The contract instance is missing the live_until_ledger_seq property. Please verify the contract ID and make sure the contract instance has been deployed to the Stellar network.',
    meta: { data: { ledgerEntries } },
  })
}

const contractCodeNotFound = (ledgerEntries: SorobanRpc.Api.GetLedgerEntriesResponse): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE004,
    message: 'Contract code not found!',
    source: 'ContractEngine',
    details:
      'Contract code not found! The contract code could not be found on the Stellar network. Please verify the contract wasm hash and make sure the contract wasm has been uploaded to the Stellar network.',
    meta: { data: { ledgerEntries } },
  })
}

const contractCodeMissingLiveUntilLedgerSeq = (
  ledgerEntries?: SorobanRpc.Api.GetLedgerEntriesResponse
): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE005,
    message: 'Contract code missing live_until_ledger_seq!',
    source: 'ContractEngine',
    details:
      'Contract code missing live_until_ledger_seq! The contract code is missing the live_until_ledger_seq property. Please verify the contract wasm hash and make sure the contract wasm has been uploaded to the Stellar network.',
    meta: { data: { ledgerEntries } },
  })
}

const failedToUploadWasm = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE101,
    message: 'Failed to upload wasm!',
    source: 'ContractEngine',
    details:
      'The wasm file could not be uploaded. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, error: error },
  })
}

const failedToDeployContract = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE102,
    message: 'Failed to deploy contract!',
    source: 'ContractEngine',
    details:
      'The contract could not be deployed. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

const failedToWrapAsset = (error: StellarPlusError): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE103,
    message: 'Failed to wrap asset!',
    source: 'ContractEngine',
    details: 'The asset could not be wrapped. Review the meta error to identify the underlying cause for this issue.',
    meta: { message: error.message, ...error.meta },
  })
}

const missingContractId = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE201,
    message: 'Missing contract ID!',
    source: 'ContractEngine',
    details:
      "Missing contract ID! This function requires a contract Id to be defined in this instance. You can either initialize the contract engine with a contract ID or use the 'deploy' function to deploy a new instance of the contract, which will automatically set the new contract Id for this instance.",
  })
}

const missingWasm = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE202,
    message: 'Missing wasm!',
    source: 'ContractEngine',
    details:
      'Missing wasm! This function requires a buffer of the wasm file to be defined in this instance. You need to initialize the contract engine with a wasm file buffer.',
  })
}

const missingWasmHash = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE203,
    message: 'Missing wasm hash!',
    source: 'ContractEngine',
    details:
      "Missing wasm hash! This function requires a wasm hash to be defined in this instance. You can either initialize the contract engine with a wasm hash or use the 'uploadWasm' function to upload a new wasm file, which will automatically set the new wasm hash for this instance.",
  })
}

const missingSpec = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE204,
    message: 'Missing spec!',
    source: 'ContractEngine',
    details:
      'Missing spec! This function requires a spec to be defined in this instance. You need to initialize the contract engine with a spec.',
  })
}

const missingSpecInWasm = (): StellarPlusError => {
  return new StellarPlusError({
    code: ContractEngineErrorCodes.CE205,
    message: 'Missing spec in wasm!',
    source: 'ContractEngine',
    details:
      'Missing spec in wasm! The wasm file does not contain the contract spec. Verify the wasm file and make sure the contract spec was compiled correctly.',
  })
}

export const CEError = {
  contractIdAlreadySet,
  contractInstanceNotFound,
  contractInstanceMissingLiveUntilLedgerSeq,
  contractCodeNotFound,
  contractCodeMissingLiveUntilLedgerSeq,
  failedToUploadWasm,
  failedToDeployContract,
  failedToWrapAsset,
  missingContractId,
  missingWasm,
  missingWasmHash,
  missingSpec,
  missingSpecInWasm,
}
