import { Asset, Contract, SorobanRpc, xdr } from '@stellar/stellar-sdk'

import { methods as tokenMethods, spec as tokenSpec } from 'stellar-plus/asset/soroban-token/constants'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import { StellarPlusError } from 'stellar-plus/error'
import { TestNet } from 'stellar-plus/network'
import { DefaultRpcHandler } from 'stellar-plus/rpc'
import { TransactionInvocation } from 'stellar-plus/types'

import { CEError } from './errors'
import { SorobanInvokeArgs } from './types'
import { ContractEngine } from '../contract-engine'
import { ContractIdOutput, ContractWasmHashOutput } from '../pipelines/soroban-get-transaction/types'

jest.mock('stellar-plus/core/pipelines/soroban-transaction', () => ({
  SorobanTransactionPipeline: jest.fn(),
}))

jest.mock('stellar-plus/rpc/default-handler', () => ({
  DefaultRpcHandler: jest.fn(),
}))

const MOCKED_SOROBAN_TRANSACTION_PIPELINE = SorobanTransactionPipeline as jest.Mock
const MOCKED_DEFAULT_RPC_HANDLER = DefaultRpcHandler as jest.Mock

const MOCKED_CONTRACT_ID = 'CBJT4BOMRHYKHZ6HF3QG4YR7Q63BE44G73M4MALDTQ3SQVUZDE7GN35I'
const MOCKED_WASM_HASH = 'eb94566536d7f56c353b4760f6e359eca3631b70d295820fb6de55a796e019ae'
const MOCKED_CONTRACT_SPEC = tokenSpec
const MOCKED_WASM_FILE = Buffer.from('mockWasm', 'utf-8')
const MOCKED_STELLAR_ASSET = Asset.native()

const MOCKED_CONTRACT_CODE_KEY = new xdr.LedgerKeyContractCode({
  hash: Buffer.from(MOCKED_WASM_HASH, 'hex'),
})
const NETWORK_CONFIG = TestNet()
const MOCKED_TX_INVOCATION: TransactionInvocation = {
  header: {
    source: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
    fee: '100',
    timeout: 100,
  },
  signers: [],
}

const MOCKED_SOROBAN_INVOKE_ARGS: SorobanInvokeArgs<object> = {
  method: tokenMethods.name,
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

  describe('Additional getters', () => {
    it('should return contract footprint', () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      const footprint = new Contract(MOCKED_CONTRACT_ID).getFootprint()
      expect(contractEngine.getContractFootprint()).toEqual(footprint)
    })

    it('should return the rpc handler', () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getRpcHandler()).toBeDefined()
    })

    it('should throw if contract code is missing the live until ledger seq', async () => {
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                key: xdr.LedgerKey.contractCode(MOCKED_CONTRACT_CODE_KEY),
                xdr: 'xdr',
              },
            ],
            latestLedger: 1,
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

      await expect(contractEngine.getContractCodeLiveUntilLedgerSeq()).rejects.toThrow(
        CEError.contractCodeMissingLiveUntilLedgerSeq()
      )
    })

    it('should return the live until ledger seq for contract code', async () => {
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                key: Object.assign(xdr.LedgerKey.contractCode(MOCKED_CONTRACT_CODE_KEY)),
                xdr: 'xdr',
                liveUntilLedgerSeq: 1,
              },
            ],
            latestLedger: 1,
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

      await expect(contractEngine.getContractCodeLiveUntilLedgerSeq()).resolves.toEqual(1)
    })

    it('should throw if contract instance is missing the live until ledger seq', async () => {
      const footprint = new Contract(MOCKED_CONTRACT_ID).getFootprint()

      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                key: footprint,
                xdr: 'xdr',
              },
            ],
            latestLedger: 1,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.getContractInstanceLiveUntilLedgerSeq()).rejects.toThrow(
        CEError.contractInstanceMissingLiveUntilLedgerSeq()
      )
    })

    it('should return the live until ledger seq for contract instance', async () => {
      const footprint = new Contract(MOCKED_CONTRACT_ID).getFootprint()

      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                key: footprint,
                xdr: 'xdr',
                liveUntilLedgerSeq: 1,
              },
            ],
            latestLedger: 1,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.getContractInstanceLiveUntilLedgerSeq()).resolves.toEqual(1)
    })
  })

  describe('Contract restore workflows', () => {
    it('should fail to restore a contract code when contract code is not found', async () => {
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [],
            latestLedger: 1,
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

      await expect(contractEngine.restoreContractCode(MOCKED_TX_INVOCATION)).rejects.toThrow(
        CEError.contractCodeNotFound({
          entries: [],
          latestLedger: 1,
        } as SorobanRpc.Api.GetLedgerEntriesResponse)
      )
    })

    it('should restore a contract code', async () => {
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                key: xdr.LedgerKey.contractCode(MOCKED_CONTRACT_CODE_KEY),
                xdr: 'xdr',
              },
            ],
            latestLedger: 1,
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

      await expect(contractEngine.restoreContractCode(MOCKED_TX_INVOCATION)).resolves.toBeUndefined()
    })

    it('should fail to restore a contract instance when contract instance is not found', async () => {
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [],
            latestLedger: 1,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.restoreContractInstance(MOCKED_TX_INVOCATION)).rejects.toThrow(
        CEError.contractInstanceNotFound({
          entries: [],
          latestLedger: 1,
        } as SorobanRpc.Api.GetLedgerEntriesResponse)
      )
    })

    it('should restore a contract instance', async () => {
      const footprint = new Contract(MOCKED_CONTRACT_ID).getFootprint()

      MOCKED_DEFAULT_RPC_HANDLER.mockImplementation(() => {
        return {
          getLedgerEntries: jest.fn().mockResolvedValue({
            entries: [
              {
                key: footprint,
                xdr: 'xdr',
              },
            ],
            latestLedger: 1,
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.restoreContractInstance(MOCKED_TX_INVOCATION)).resolves.toBeUndefined()
    })
  })

  describe('Contract invocation', () => {
    it('should not wrap and deploy with a contract id', async () => {
      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(
        contractEngine.wrapAndDeployClassicAsset({ asset: MOCKED_STELLAR_ASSET, ...MOCKED_TX_INVOCATION })
      ).rejects.toThrow(CEError.contractIdAlreadySet())
    })

    it('should wrap and deploy a classic asset', async () => {
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

      await expect(
        contractEngine.wrapAndDeployClassicAsset({ asset: MOCKED_STELLAR_ASSET, ...MOCKED_TX_INVOCATION })
      ).resolves.toBeUndefined()

      expect(contractEngine.getContractId()).toEqual(MOCKED_CONTRACT_ID)
    })

    it('should surface exceptions from the transaction pipeline when wrapping and deploying a classic asset', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockRejectedValue(StellarPlusError.unexpectedError()),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(
        contractEngine.wrapAndDeployClassicAsset({ asset: MOCKED_STELLAR_ASSET, ...MOCKED_TX_INVOCATION })
      ).rejects.toThrow(CEError.failedToWrapAsset(StellarPlusError.unexpectedError()))
    })

    it('should surface exceptions from the transaction pipeline when deploying a contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockRejectedValue(StellarPlusError.unexpectedError()),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.deploy(MOCKED_TX_INVOCATION)).rejects.toThrow(
        CEError.failedToDeployContract(StellarPlusError.unexpectedError())
      )
    })

    it('should surface exceptions from the transaction pipeline when uploading a wasm', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockRejectedValue(StellarPlusError.unexpectedError()),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.uploadWasm(MOCKED_TX_INVOCATION)).rejects.toThrow(
        CEError.failedToUploadWasm(StellarPlusError.unexpectedError())
      )
    })

    it('should surface exceptions from the transaction pipeline when invoking a contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockRejectedValue(StellarPlusError.unexpectedError()),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.invokeContract(MOCKED_SOROBAN_INVOKE_ARGS)).rejects.toThrow(
        StellarPlusError.unexpectedError()
      )
    })

    it('should surface exceptions from the transaction pipeline when reading from a contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockRejectedValue(StellarPlusError.unexpectedError()),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.readFromContract(MOCKED_SOROBAN_INVOKE_ARGS)).rejects.toThrow(
        StellarPlusError.unexpectedError()
      )
    })

    it('should invoke a contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockResolvedValue({
            output: { value: true },
          }),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.invokeContract(MOCKED_SOROBAN_INVOKE_ARGS)).resolves.toEqual(true)
    })

    it('should read from a contract', async () => {
      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: jest.fn().mockResolvedValue(true),
        }
      })

      const contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      await expect(contractEngine.readFromContract(MOCKED_SOROBAN_INVOKE_ARGS)).resolves.toEqual(true)
    })
  })
})
