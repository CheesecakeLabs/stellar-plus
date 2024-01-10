import { Asset } from '@stellar/stellar-sdk'

import { spec } from 'stellar-plus/asset/soroban-token/constants'
import { testnet } from 'stellar-plus/constants'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { CEError } from 'stellar-plus/core/contract-engine/errors'
import { ContractEngineConstructorArgs, TransactionCosts } from 'stellar-plus/core/contract-engine/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { mockUnsignedClassicTransaction } from 'stellar-plus/test/mocks/classic-transaction'
import { mockTransactionInvocation } from 'stellar-plus/test/mocks/transaction-mock'

import { SorobanInvokeArgs, SorobanSimulateArgs } from '../soroban-transaction-processor/types'

const mockCEConstructorBaseArgs: ContractEngineConstructorArgs = {
  network: testnet,
  spec: spec,
}

class TestableContractEngine extends ContractEngine {
  public invokeContractTest(args: SorobanInvokeArgs<object>): Promise<unknown> {
    return this.invokeContract(args)
  }
  public readFromContractTest(args: SorobanSimulateArgs<object>): Promise<unknown> {
    return this.readFromContract(args)
  }
}

const mockTransactionCosts: TransactionCosts = {
  cpuInstructions: 10,
  ram: 10,
  minResourceFee: 10,
  ledgerReadBytes: 10,
  ledgerWriteBytes: 10,
  ledgerEntryReads: 10,
  ledgerEntryWrites: 10,
  eventSize: 10,
  returnValueSize: 10,
  transactionSize: 10,
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

    it('should throw an error if values are missing in getters', () => {
      const mockContractEngineWithoutValues: ContractEngine = new ContractEngine({
        ...mockCEConstructorBaseArgs,
      })
      expect(() => mockContractEngineWithoutValues.getWasm()).toThrowError(CEError.missingWasm())
      expect(() => mockContractEngineWithoutValues.getWasmHash()).toThrowError(CEError.missingWasmHash())
      expect(() => mockContractEngineWithoutValues.getContractId()).toThrowError(CEError.missingContractId())
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

  describe('invokeContract', () => {
    it('should invoke a contract method and return the output', async () => {
      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'prepareTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'processSorobanTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromProcessedInvocation')
        .mockResolvedValueOnce('mock-output')

      expect(
        await mockContractEngineWithContractId.invokeContractTest({
          method: 'mock-method',
          methodArgs: { arg: 'mock-method-args' },
          ...mockTxInvocation,
        })
      ).toEqual('mock-output')
    })

    it('should throw an error if contract id is missing', async () => {
      const mockContractEngineWithoutContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
      })

      await expect(
        mockContractEngineWithoutContractId.invokeContractTest({
          method: 'mock-method',
          methodArgs: { arg: 'mock-method-args' },
          ...mockTxInvocation,
        })
      ).rejects.toThrowError(CEError.missingContractId())
    })
  })

  describe('readFromContract', () => {
    it('should read from a contract method and return the output', async () => {
      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'simulateTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromSimulation')
        .mockResolvedValueOnce('mock-output')

      expect(
        await mockContractEngineWithContractId.readFromContractTest({
          method: 'mock-method',
          methodArgs: { arg: 'mock-method-args' },
          ...mockTxInvocation,
        })
      ).toEqual('mock-output')
    })

    it('should throw an error if contract id is missing', async () => {
      const mockContractEngineWithoutContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
      })

      await expect(
        mockContractEngineWithoutContractId.readFromContractTest({
          method: 'mock-method',
          methodArgs: { arg: 'mock-method-args' },
          ...mockTxInvocation,
        })
      ).rejects.toThrowError(CEError.missingContractId())
    })
  })

  describe('options', () => {
    it('should invoke costHandler if provided when debug is true and return the transaction costs - invoke contract', async () => {
      const mockCostHandler = jest.fn()

      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
        options: {
          debug: true,
          costHandler: mockCostHandler,
        },
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'prepareTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'processSorobanTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromProcessedInvocation')
        .mockResolvedValueOnce('mock-output')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractTransactionCosts')
        .mockResolvedValueOnce(mockTransactionCosts)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractFeeCharged')
        .mockResolvedValueOnce(10)

      await mockContractEngineWithContractId.invokeContractTest({
        method: 'mock-method',
        methodArgs: { arg: 'mock-method-args' },
        ...mockTxInvocation,
      })

      expect(mockCostHandler).toHaveBeenCalledTimes(1)
      expect(mockCostHandler).toHaveBeenCalledWith(
        'mock-method',
        mockTransactionCosts,
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should not invoke costHandler if provided when debug is false - invoke contract', async () => {
      const mockCostHandler = jest.fn()

      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
        options: {
          debug: false,
          costHandler: mockCostHandler,
        },
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'prepareTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'processSorobanTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromProcessedInvocation')
        .mockResolvedValueOnce('mock-output')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractTransactionCosts')
        .mockResolvedValueOnce(mockTransactionCosts)

      await mockContractEngineWithContractId.invokeContractTest({
        method: 'mock-method',
        methodArgs: { arg: 'mock-method-args' },
        ...mockTxInvocation,
      })

      expect(mockCostHandler).toHaveBeenCalledTimes(0)
      expect(mockCostHandler).not.toHaveBeenCalledWith('mock-method', mockTransactionCosts, expect.any(Number))
    })

    it('should invoke costHandler if provided when debug is true and return the transaction costs - read from contract', async () => {
      const mockCostHandler = jest.fn()

      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
        options: {
          debug: true,
          costHandler: mockCostHandler,
        },
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'simulateTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromSimulation')
        .mockResolvedValueOnce('mock-output')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractTransactionCosts')
        .mockResolvedValueOnce(mockTransactionCosts)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractFeeCharged')
        .mockResolvedValueOnce(10)

      await mockContractEngineWithContractId.readFromContractTest({
        method: 'mock-method',
        methodArgs: { arg: 'mock-method-args' },
        ...mockTxInvocation,
      })

      expect(mockCostHandler).toHaveBeenCalledTimes(1)
      expect(mockCostHandler).toHaveBeenCalledWith(
        'mock-method',
        mockTransactionCosts,
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should not invoke costHandler if provided when debug is false - read from contract', async () => {
      const mockCostHandler = jest.fn()

      const mockContractEngineWithContractId: TestableContractEngine = new TestableContractEngine({
        ...mockCEConstructorBaseArgs,
        contractId: 'mock-contract-id',
        options: {
          debug: false,
          costHandler: mockCostHandler,
        },
      })

      // Allowing these instances of 'any' to be able to mock the internal methods
      // which are protected and and would required a more complex approach
      // to mock.
      //
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'buildTransaction')
        .mockResolvedValueOnce(mockUnsignedClassicTransaction)
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'simulateTransaction')
        .mockResolvedValueOnce('mock-output-unprocessed')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractOutputFromSimulation')
        .mockResolvedValueOnce('mock-output')
      jest // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(mockContractEngineWithContractId as any, 'extractTransactionCosts')
        .mockResolvedValueOnce(mockTransactionCosts)

      await mockContractEngineWithContractId.readFromContractTest({
        method: 'mock-method',
        methodArgs: { arg: 'mock-method-args' },
        ...mockTxInvocation,
      })

      expect(mockCostHandler).toHaveBeenCalledTimes(0)
      expect(mockCostHandler).not.toHaveBeenCalledWith(
        'mock-method',
        mockTransactionCosts,
        expect.any(Number),
        expect.any(Number)
      )
    })
  })
})
