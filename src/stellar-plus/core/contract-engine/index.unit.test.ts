import { ContractSpec } from '@stellar/stellar-sdk'
import { ContractEngine } from '../contract-engine'
import { Constants } from 'stellar-plus'
import { spec as tokenSpec } from 'stellar-plus/asset/soroban-token/constants'

const MOCKED_CONTRACT_ID = 'CBJT4BOMRHYKHZ6HF3QG4YR7Q63BE44G73M4MALDTQ3SQVUZDE7GN35I'
const MOCKED_WASM_HASH = 'eb94566536d7f56c353b4760f6e359eca3631b70d295820fb6de55a796e019ae'
const MOCKED_CONTRACT_SPEC = tokenSpec
const MOCKED_WASM_FILE = Buffer.from('mockWasm', 'utf-8')
const NETWORK_CONFIG = Constants.testnet

describe('ContractEngine', () => {
  let contractEngine: ContractEngine

  beforeEach(() => {
    // contractEngine = new ContractEngine();
  })

  describe('Intialization', () => {
    it('should initialize with wasm file', () => {
      contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getWasm()).toEqual(MOCKED_WASM_FILE)
    })

    it('should initialize with wasm hash', () => {
      contractEngine = new ContractEngine({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasmHash: MOCKED_WASM_HASH,
          spec: MOCKED_CONTRACT_SPEC,
        },
      })

      expect(contractEngine.getWasmHash()).toEqual(MOCKED_WASM_HASH)
    })
  })

  //   it('should initialize with default values', () => {
  //     expect(contractEngine.getContracts()).toEqual([])
  //   })
})
