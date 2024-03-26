import { ContractEngine } from '../contract-engine'
import { Constants } from 'stellar-plus'
import { spec as tokenSpec } from 'stellar-plus/asset/soroban-token/constants'
import { CEError } from './errors'
import { TransactionInvocation } from 'stellar-plus/types'
import { SorobanInvokeArgs } from './types'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import { before } from 'node:test'
import { ContractIdOutput, ContractWasmHashOutput } from '../pipelines/soroban-get-transaction/types'

jest.mock('stellar-plus/core/pipelines/soroban-transaction', () => ({
  SorobanTransactionPipeline: jest.fn(),
}))

const MOCKED_SOROBAN_TRANSACTION_PIPELINE = SorobanTransactionPipeline as jest.Mock

const MOCKED_CONTRACT_ID = 'CBJT4BOMRHYKHZ6HF3QG4YR7Q63BE44G73M4MALDTQ3SQVUZDE7GN35I'
const MOCKED_WASM_HASH = 'eb94566536d7f56c353b4760f6e359eca3631b70d295820fb6de55a796e019ae'
const MOCKED_CONTRACT_SPEC = tokenSpec
const MOCKED_WASM_FILE = Buffer.from('mockWasm', 'utf-8')
const NETWORK_CONFIG = Constants.testnet
const MOCKED_TX_INVOCATION: TransactionInvocation = {
  header: {
    source: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
    fee: '100',
    timeout: 100,
  },
  signers: [],
}

const MOCKED_SOROBAN_INVOKE_ARGS: SorobanInvokeArgs<{}> = {
  method: 'method',
  methodArgs: {},
  ...MOCKED_TX_INVOCATION,
}

describe('ContractEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Intialization', () => {
    it('should initialize with wasm file', () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getWasm()).toEqual(MOCKED_WASM_FILE)
    })

    it('should initialize with wasm hash', () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getWasmHash()).toEqual(MOCKED_WASM_HASH)
    })

    it('should initialize with contract id', () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getContractId()).toEqual(MOCKED_CONTRACT_ID)
    })
  })

  describe('Initialization Errors', () => {
    it('should throw error if no wasm file, wasm hash or contract id is provided', () => {
      expect(() => {
        const contractEngine = new ContractEngine({
          networkConfig: NETWORK_CONFIG,
          contractParameters: {
            spec: MOCKED_CONTRACT_SPEC,
          },
        })
      }).toThrow(CEError.contractEngineClassFailedToInitialize())
    })

    it('should throw error if wasm file is required but is not present', async () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          spec: MOCKED_CONTRACT_SPEC,
          wasmHash: MOCKED_WASM_HASH,
        },
      })

      expect(() => contractEngine.getWasm()).toThrow(CEError.missingWasm())

      await expect(contractEngine.uploadWasm(MOCKED_TX_INVOCATION)).rejects.toThrow(CEError.missingWasm())
    })

    it('should throw error if wasm hash is required but is not present', async () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          spec: MOCKED_CONTRACT_SPEC,
          wasm: MOCKED_WASM_FILE,
        },
      })

      expect(() => contractEngine.getWasmHash()).toThrow(CEError.missingWasmHash())

      await expect(contractEngine.deploy(MOCKED_TX_INVOCATION)).rejects.toThrow(CEError.missingWasmHash())
      await expect(contractEngine.getContractCodeLiveUntilLedgerSeq()).rejects.toThrow(CEError.missingWasmHash())
      await expect(contractEngine.getContractInstanceLiveUntilLedgerSeq()).rejects.toThrow(CEError.missingWasmHash())
      await expect(contractEngine.restoreContractCode(MOCKED_TX_INVOCATION)).rejects.toThrow(CEError.missingWasmHash())
      await expect(contractEngine.restoreContractInstance(MOCKED_TX_INVOCATION)).rejects.toThrow(
        CEError.missingWasmHash()
      )
    })

    it('should throw error if contract id is required but is not present', async () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          spec: MOCKED_CONTRACT_SPEC,
          wasmHash: MOCKED_WASM_HASH,
        },
      })

      expect(() => contractEngine.getContractId()).toThrow(CEError.missingContractId())
      expect(() => contractEngine.getContractFootprint()).toThrow(CEError.missingContractId())

      await expect(contractEngine.invokeContract(MOCKED_SOROBAN_INVOKE_ARGS)).rejects.toThrow(
        CEError.missingContractId()
      )
      await expect(contractEngine.readFromContract(MOCKED_SOROBAN_INVOKE_ARGS)).rejects.toThrow(
        CEError.missingContractId()
      )
      await expect(contractEngine.runTransactionPipeline(MOCKED_SOROBAN_INVOKE_ARGS)).rejects.toThrow(
        CEError.missingContractId()
      )
    })
  })

  describe('Initialization workflow', () => {
    it('should upload wasm', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockResolvedValue({
            output: {
              wasmHash: MOCKED_WASM_HASH,
            } as ContractWasmHashOutput,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.uploadWasm(MOCKED_TX_INVOCATION)).resolves.toBeUndefined()
      expect(contractEngine.getWasm()).toEqual(MOCKED_WASM_FILE)
    })

    it('should deploy contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockResolvedValue({
            output: {
              contractId: MOCKED_CONTRACT_ID,
            } as ContractIdOutput,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.deploy(MOCKED_TX_INVOCATION)).resolves.toBeUndefined()
      expect(contractEngine.getContractId()).toEqual(MOCKED_CONTRACT_ID)
    })
  })
})
