import { Asset } from '@stellar/stellar-sdk'

import { spec } from 'stellar-plus/asset/soroban-token/constants'
import { testnet } from 'stellar-plus/constants'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { CEError } from 'stellar-plus/core/contract-engine/errors'
import { ContractEngineConstructorArgs } from 'stellar-plus/core/contract-engine/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { mockTransactionInvocation } from 'stellar-plus/test/mocks/transaction-mock'

const mockCEConstructorBaseArgs: ContractEngineConstructorArgs = {
  network: testnet,
  spec: spec,
}

describe('ContractEngine', () => {
  let mockTxInvocation: TransactionInvocation

  beforeEach(() => {
    mockTxInvocation = mockTransactionInvocation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should correctly initialize the contract engine', () => {
      const mockContractEngineWithWasm: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        wasm: Buffer.from('mock-wasm'),
      })
      expect(mockContractEngineWithWasm.getWasm()).toEqual(Buffer.from('mock-wasm'))

      const mockContractEngineWithWasmHash: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        wasmHash: 'mock-wasm-hash',
      })
      expect(mockContractEngineWithWasmHash.getWasmHash()).toEqual('mock-wasm-hash')

      const mockContractEngineWithContractId: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
      })

      expect(mockContractEngineWithContractId.getContractId()).toEqual('mock-contract-id')
    })
  })

  describe('uploadWasm', () => {
    it('should upload WASM and update wasmHash', async () => {
      const mockContractEngineWithWasm: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        wasm: Buffer.from('mock-wasm'),
      })

      // Allowing this instance of 'any' to be able to mock the internal method
      // uploadContractWasm which is protected and and would required a more complex approach
      // to mock it.
      //
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(mockContractEngineWithWasm as any, 'uploadContractWasm').mockResolvedValueOnce('mock-wasm-hash')

      await mockContractEngineWithWasm.uploadWasm(mockTxInvocation)
      expect(mockContractEngineWithWasm.getWasmHash()).toEqual('mock-wasm-hash')
    })

    it('should throw an error if wasm is missing', async () => {
      const mockContractEngineWithoutWasm: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
      })

      await expect(mockContractEngineWithoutWasm.uploadWasm(mockTxInvocation)).rejects.toThrowError(
        CEError.missingWasm()
      )
    })
  })

  describe('deploy contract', () => {
    it('should deploy a new instance of the contract and update contract id', async () => {
      const mockContractEngineWithWasmHash: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        wasmHash: 'mock-wasm-hash',
      })

      // Allowing this instance of 'any' to be able to mock the internal method
      // deployContract which is protected and and would required a more complex approach
      // to mock it.
      //
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(mockContractEngineWithWasmHash as any, 'deployContract').mockResolvedValueOnce('mock-contract-id')

      await mockContractEngineWithWasmHash.deploy(mockTxInvocation)
      expect(mockContractEngineWithWasmHash.getContractId()).toEqual('mock-contract-id')
    })

    it('should throw an error if wasm hash is missing', async () => {
      const mockContractEngineWithoutWasmHash: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
      })

      await expect(mockContractEngineWithoutWasmHash.deploy(mockTxInvocation)).rejects.toThrowError(
        CEError.missingWasmHash()
      )
    })
  })

  describe('wrap asset contract', () => {
    it('should wrap a classic asset and update the contract id', async () => {
      const mockContractEngineWithoutContractId: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
      })

      // Allowing this instance of 'any' to be able to mock the internal method
      // wrapClassicAsset which is protected and and would required a more complex approach
      // to mock it.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithoutContractId as any, 'wrapClassicAsset')
        .mockResolvedValueOnce('mock-contract-id')

      const mockAsset = new Asset('mockAsset', 'GBKIJOMRI2BRGEJ3CCME2E3Q6B6LOGQLL4KLDBLYDKVSHGY7CAROYISV')

      await mockContractEngineWithoutContractId.wrapAndDeployClassicAsset({ asset: mockAsset, ...mockTxInvocation })
      expect(mockContractEngineWithoutContractId.getContractId()).toEqual('mock-contract-id')
    })

    it('should throw an error if contract already has a contract Id', async () => {
      const mockContractEngineWithContractId: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
      })

      const mockAsset = new Asset('mockAsset', 'GBKIJOMRI2BRGEJ3CCME2E3Q6B6LOGQLL4KLDBLYDKVSHGY7CAROYISV')
      await expect(
        mockContractEngineWithContractId.wrapAndDeployClassicAsset({ asset: mockAsset, ...mockTxInvocation })
      ).rejects.toThrowError(CEError.contractIdAlreadySet())
    })
  })

  // Additional tests for deploy, wrapAndDeployClassicAsset, invokeContract, readFromContract, etc.

  // Example:
  //   describe('invokeContract', () => {
  //     it('should invoke a contract method and return the output', async () => {})

  //     // Add more tests for different scenarios
  //   })

  // Similarly, add tests for other methods and scenarios.
})
