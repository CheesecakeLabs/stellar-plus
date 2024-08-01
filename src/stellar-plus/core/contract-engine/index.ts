import { Buffer } from 'buffer'

import {
  Address,
  Contract,
  Operation,
  OperationOptions,
  SorobanDataBuilder,
  SorobanRpc as SorobanRpcNamespace,
  xdr,
} from '@stellar/stellar-sdk'
import { Spec } from '@stellar/stellar-sdk/contract'

import { CEError } from 'stellar-plus/core/contract-engine/errors'
import {
  ContractEngineConstructorArgs,
  Options,
  RestoreFootprintArgs,
  SorobanInvokeArgs,
  SorobanSimulateArgs,
  WrapClassicAssetArgs,
  isRestoreFootprintWithLedgerKeys,
} from 'stellar-plus/core/contract-engine/types'
import {
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import {
  SorobanTransactionPipelineOutput,
  VerboseExecutedOutput,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { StellarPlusError } from 'stellar-plus/error'
import { DefaultRpcHandler } from 'stellar-plus/rpc'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { NetworkConfig } from 'stellar-plus/types'
import { generateRandomSalt } from 'stellar-plus/utils/functions'
import { InjectPreprocessParameterPlugin } from 'stellar-plus/utils/pipeline/plugins/generic/inject-preprocess-parameter'
import { ExtractInvocationOutputFromSimulationPlugin } from 'stellar-plus/utils/pipeline/plugins/simulate-transaction/extract-invocation-output'
import { ExtractContractIdPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-get-transaction/extract-contract-id'
import { ExtractInvocationOutputPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-get-transaction/extract-invocation-output'
import { ExtractWasmHashPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-get-transaction/extract-wasm-hash'

export class ContractEngine {
  private spec?: Spec
  private contractId?: string
  private wasm?: Buffer
  private wasmHash?: string
  private networkConfig: NetworkConfig
  private rpcHandler: RpcHandler

  private sorobanTransactionPipeline: SorobanTransactionPipeline

  private options: Options

  /**
   *
   * @param {NetworkConfig} networkConfig - The network to use.
   * @param contractParameters - The contract parameters.
   * @param {Spec} contractParameters.spec - The contract specification object.
   * @param {string=} contractParameters.contractId - The contract id.
   * @param {Buffer=} contractParameters.wasm - The contract wasm file as a buffer.
   * @param {string=} contractParameters.wasmHash - The contract wasm hash id.
   * @param {Options=} options - A set of custom options to modify the behavior of the contract engine.
   * @param {SorobanTransactionPipelineOptions=} options.sorobanTransactionPipeline - The Soroban transaction pipeline.
   * @description - The contract engine is used for interacting with contracts on the network. This class can be extended to create a contract client, abstracting away the Soroban integration.
   *
   * @example - The following example shows how to invoke a contract method that alters the state of the contract.
   * ```typescript
   * const contract = new ContractEngine(network, spec, contractId)
   *
   * const output = await contract.invoke({
   *   method: 'add',
   *   args: {
   *     a: 1,
   *     b: 2,
   *   },
   *   signers: [accountHandler],
   * })
   *
   * console.log(output) // 3
   * ```
   *
   * @example - The following example shows how to invoke a contract method that does not alter the state of the contract.
   * ```typescript
   * const contract = new ContractEngine(network, spec, contractId)
   * const output = await contract.read({
   *  method: 'get',
   * args: {
   *  key: 'myKey',
   * },
   * })
   * console.log(output) // 'myValue'
   * ```
   */
  constructor(args: ContractEngineConstructorArgs) {
    const { networkConfig, contractParameters, options } = args as ContractEngineConstructorArgs
    this.networkConfig = networkConfig
    this.rpcHandler = options?.sorobanTransactionPipeline?.customRpcHandler
      ? options.sorobanTransactionPipeline.customRpcHandler
      : new DefaultRpcHandler(this.networkConfig)
    this.spec = contractParameters.spec
    this.contractId = contractParameters.contractId
    this.wasm = contractParameters.wasm
    this.wasmHash = contractParameters.wasmHash

    this.options = { ...options }

    this.sorobanTransactionPipeline = new SorobanTransactionPipeline(networkConfig, {
      customRpcHandler: options?.sorobanTransactionPipeline?.customRpcHandler,
      ...this.options.sorobanTransactionPipeline,
    })
  }

  public getContractId(): string {
    this.requireContractId()
    return this.contractId as string
  }

  public getWasm(): Buffer {
    this.requireWasm()
    return this.wasm as Buffer
  }

  public getWasmHash(): string {
    this.requireWasmHash()
    return this.wasmHash as string
  }

  public getContractFootprint(): xdr.LedgerKey {
    this.requireContractId()
    return new Contract(this.contractId!).getFootprint()
  }

  public getRpcHandler(): RpcHandler {
    return this.rpcHandler
  }

  /**
   * 
   * @param {void} args - No arguments.
   * 
   * @returns {Promise<number>} The 'liveUntilLedgerSeq' value representing the ledger sequence number until which the contract instance is live.
   * 
   * @description - Returns the ledger sequence number until which the contract instance is live. When the contract instance is live, it can be invoked. When the liveUntilLedgerSeq is reached, the contract instance is archived and can no longer be invoked until a restore is performed.
   
   */
  public async getContractInstanceLiveUntilLedgerSeq(): Promise<number> {
    const contractInstance = await this.getContractInstanceLedgerEntry()

    if (!contractInstance.liveUntilLedgerSeq) {
      throw CEError.contractInstanceMissingLiveUntilLedgerSeq()
    }
    return contractInstance.liveUntilLedgerSeq
  }

  /**
   *
   * @param {void} args - No arguments.
   *
   * @returns {Promise<number>} The 'liveUntilLedgerSeq' value representing the ledger sequence number until which the contract code is live.
   *
   * @description - Returns the ledger sequence number until which the contract code is live. When the contract code is live, it can be deployed into new instances, generating a new unique contract id for each. When the liveUntilLedgerSeq is reached, the contract code is archived and can no longer be deployed until a restore is performed.
   *
   * */
  public async getContractCodeLiveUntilLedgerSeq(): Promise<number> {
    const contractCode = await this.getContractCodeLedgerEntry()

    if (!contractCode.liveUntilLedgerSeq) {
      throw CEError.contractCodeMissingLiveUntilLedgerSeq()
    }

    return contractCode.liveUntilLedgerSeq
  }

  /**
   *
   * @args {SorobanSimulateArgs<object>} args - The arguments for the invocation.
   * @param {string} args.method - The method to invoke as it is identified in the contract.
   * @param {object} args.methodArgs - The arguments for the method invocation.
   * @param {EnvelopeHeader} args.header - The header for the invocation.
   *
   * @returns {Promise<unknown>} The output of the invocation.
   *
   * @description - Simulate an invocation of a contract method that does not alter the state of the contract.
   * This function does not require any signers. It builds a transaction, simulates it, and extracts the output of the invocation from the simulation.
   *
   * @example - The following example shows how to simulate a contract method invocation.
   * ```typescript
   * const contract = new ContractEngine(network, spec, contractId)
   * const output = await contract.read({
   *  method: 'get',
   * args: {
   *  key: 'myKey',
   * },
   * })
   * console.log(output) // 'myValue'
   * ```
   */
  public async readFromContract(args: SorobanSimulateArgs<object>): Promise<SorobanTransactionPipelineOutput> {
    const options = { ...(args as SorobanInvokeArgs<object>).options, simulateOnly: true }
    return await this.runTransactionPipeline({ ...args, options })
  }

  /**
   *
   * @args {SorobanInvokeArgs<object>} args - The arguments for the invocation.
   * @param {string} args.method - The method to invoke as it is identified in the contract.
   * @param {object} args.methodArgs - The arguments for the method invocation.
   * @param {EnvelopeHeader} args.header - The header for the invocation.
   * @param {AccountHandler[]} args.signers - The signers for the invocation.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the invocation.
   *
   * @returns {Promise<unknown>} The output of the invocation.
   *
   * @description - Invokes a contract method that alters the state of the contract.
   * This function requires signers. It builds a transaction, simulates it, signs it, submits it to the network, and extracts the output of the invocation from the processed transaction.
   *
   * @example - The following example shows how to invoke a contract method that alters the state of the contract.
   * ```typescript
   * const contract = new ContractEngine(network, spec, contractId)
   *
   * const output = await contract.invoke({
   *   method: 'add',
   *   args: {
   *     a: 1,
   *     b: 2,
   *   },
   *   signers: [accountHandler],
   * })
   *
   * console.log(output) // 3
   * ```
   */
  public async invokeContract(
    args: SorobanInvokeArgs<object> | SorobanSimulateArgs<object>
  ): Promise<SorobanTransactionPipelineOutput> {
    const options = { ...(args as SorobanInvokeArgs<object>).options, simulateOnly: false }
    return await this.runTransactionPipeline({ ...args, options })
  }
  public async runTransactionPipeline(
    args: SorobanInvokeArgs<object> | SorobanSimulateArgs<object>
  ): Promise<SorobanTransactionPipelineOutput> {
    this.requireContractId()
    this.requireSpec()

    const { method, methodArgs, options } = args
    const txInvocation = { ...(args as SorobanInvokeArgs<object>) } as TransactionInvocation

    const encodedArgs = this.spec!.funcArgsToScVals(method, methodArgs) // Spec verified in requireSpec

    const contract = new Contract(this.contractId!) // Contract Id verified in requireContractId
    const contractCallOperation = contract.call(method, ...encodedArgs)

    const executionPlugins = [
      ...(options?.simulateOnly
        ? [new ExtractInvocationOutputFromSimulationPlugin(this.spec!, method)]
        : [new ExtractInvocationOutputPlugin(this.spec!, method)]),
      ...(options?.executionPlugins || []),
    ]

    const result = await this.sorobanTransactionPipeline.execute({
      txInvocation,
      operations: [contractCallOperation],
      options: { ...options, executionPlugins },
    })

    return result as SorobanTransactionPipelineOutput
  }
  //==========================================
  // Meta Management Methods
  //==========================================
  //
  //

  /**
   * @param {TransactionInvocation} txInvocation - The transaction invocation object to use in this transaction.
   *
   * @description - Uploads the contract wasm to the network and stores the wasm hash in the contract engine.
   *
   * @requires - The wasm file buffer to be set in the contract engine.
   *
   * */
  public async uploadWasm(txInvocation: TransactionInvocation): Promise<void> {
    this.requireWasm()

    try {
      const uploadOperation = Operation.uploadContractWasm({ wasm: this.wasm! }) // Wasm verified in requireWasm

      const result = await this.sorobanTransactionPipeline.execute({
        txInvocation,
        operations: [uploadOperation],
        options: {
          executionPlugins: [new ExtractWasmHashPlugin()],
          verboseOutput: true,
        },
      })

      this.wasmHash = (result as VerboseExecutedOutput).sorobanGetTransactionPipelineOutput.output?.wasmHash
    } catch (error) {
      throw CEError.failedToUploadWasm(error as StellarPlusError)
    }
  }

  /**
   * @param {TransactionInvocation} txInvocation - The transaction invocation object to use in this transaction.
   *
   * @description - Deploys a new instance of the contract to the network and stores the contract id in the contract engine.
   *
   * @requires - The wasm hash to be set in the contract engine.
   *
   * */
  public async deploy(txInvocation: TransactionInvocation): Promise<void> {
    this.requireWasmHash()

    try {
      const deployOperation = Operation.createCustomContract({
        address: new Address(txInvocation.header.source),
        wasmHash: Buffer.from(this.wasmHash!, 'hex'), // Wasm hash verified in requireWasmHash
        salt: generateRandomSalt(),
      } as OperationOptions.CreateCustomContract)

      const result = await this.sorobanTransactionPipeline.execute({
        txInvocation,
        operations: [deployOperation],
        options: {
          executionPlugins: [new ExtractContractIdPlugin()],
          verboseOutput: true,
        },
      })

      this.contractId = (result as VerboseExecutedOutput).sorobanGetTransactionPipelineOutput.output?.contractId
    } catch (error) {
      throw CEError.failedToDeployContract(error as StellarPlusError)
    }
  }

  public async wrapAndDeployClassicAsset(args: WrapClassicAssetArgs): Promise<void> {
    this.requireNoContractId()

    try {
      const txInvocation = args as TransactionInvocation

      const wrapOperation = Operation.createStellarAssetContract({
        asset: args.asset,
      } as OperationOptions.CreateStellarAssetContract)

      const result = await this.sorobanTransactionPipeline.execute({
        txInvocation,
        operations: [wrapOperation],
        options: {
          executionPlugins: [new ExtractContractIdPlugin()],
          verboseOutput: true,
        },
      })

      this.contractId = (result as VerboseExecutedOutput).sorobanGetTransactionPipelineOutput.output?.contractId
    } catch (error) {
      let isAssetAlreadyWrapped = false
      try {
        const events = (error as StellarPlusError).meta?.sorobanSimulationData?.events
        const dataVec: xdr.ScVal[] | null = events ? events[0].event().body().v0().data().vec() : []

        if (dataVec && dataVec[0].value()?.toString() === 'contract already exists') {
          const contractId = Address.contract(dataVec[1].bytes()).toString()
          this.contractId = contractId
          isAssetAlreadyWrapped = true
        }
      } finally {
        if (!isAssetAlreadyWrapped) {
          // eslint-disable-next-line no-unsafe-finally
          throw CEError.failedToWrapAsset(error as StellarPlusError)
        }
      }
    }
  }

  public async restoreContractInstance(args: TransactionInvocation): Promise<void> {
    return await this.restore({
      keys: [(await this.getContractInstanceLedgerEntry()).key],
      ...(args as TransactionInvocation),
    })
  }

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation object to use in this transaction.
   *
   * @returns {Promise<void>} - The output of the invocation.
   *
   * @description - Restores the contract code.
   */
  public async restoreContractCode(args: TransactionInvocation): Promise<void> {
    return await this.restore({
      keys: [(await this.getContractCodeLedgerEntry()).key],
      ...(args as TransactionInvocation),
    })
  }

  //==========================================
  // Internal Methods
  //==========================================
  //
  //
  private requireContractId(): void {
    if (!this.contractId) {
      throw CEError.missingContractId()
    }
  }
  private requireNoContractId(): void {
    if (this.contractId) {
      throw CEError.contractIdAlreadySet()
    }
  }

  private requireWasm(): void {
    if (!this.wasm) {
      throw CEError.missingWasm()
    }
  }

  private requireWasmHash(): void {
    if (!this.wasmHash) {
      throw CEError.missingWasmHash()
    }
  }

  private requireSpec(): void {
    if (!this.spec) {
      throw CEError.missingSpec()
    }
  }

  protected async getContractCodeLedgerEntry(): Promise<SorobanRpcNamespace.Api.LedgerEntryResult> {
    this.requireWasmHash()

    const ledgerEntries = (await this.getRpcHandler().getLedgerEntries(
      xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: Buffer.from(this.getWasmHash(), 'hex') }))
    )) as SorobanRpcNamespace.Api.GetLedgerEntriesResponse

    const contractCode = ledgerEntries.entries.find((entry) => entry.key.switch().name === 'contractCode')

    if (!contractCode) {
      throw CEError.contractCodeNotFound(ledgerEntries)
    }
    return contractCode as SorobanRpcNamespace.Api.LedgerEntryResult
  }

  protected async getContractInstanceLedgerEntry(): Promise<SorobanRpcNamespace.Api.LedgerEntryResult> {
    this.requireWasmHash()

    const footprint = this.getContractFootprint()

    const ledgerEntries = (await this.getRpcHandler().getLedgerEntries(
      footprint
    )) as SorobanRpcNamespace.Api.GetLedgerEntriesResponse

    const contractInstance = ledgerEntries.entries.find((entry) => entry.key.switch().name === 'contractData')

    if (!contractInstance) {
      throw CEError.contractInstanceNotFound(ledgerEntries)
    }

    return contractInstance as SorobanRpcNamespace.Api.LedgerEntryResult
  }

  /**
   * @args {RestoreFootprintArgs} args - The arguments for the invocation.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   * @param {AccountHandler[]} args.signers - The signers for the transaction.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the transaction. This is optional.
   *
   * Option 1: Provide the keys directly.
   * @param {xdr.LedgerKey[]} args.keys - The keys to restore.
   * Option 2: Provide the restore preamble.
   * @param { RestoreFootprintWithRestorePreamble} args.restorePreamble - The restore preamble.
   * @param {string} args.restorePreamble.minResourceFee - The minimum resource fee.
   * @param {SorobanDataBuilder} args.restorePreamble.transactionData - The transaction data.
   *
   * @returns {Promise<void>}
   *
   * @description - Execute a transaction to restore a given footprint.
   */
  protected async restore(args: RestoreFootprintArgs): Promise<void> {
    const txInvocation = args as TransactionInvocation
    const sorobanData = isRestoreFootprintWithLedgerKeys(args)
      ? new SorobanDataBuilder().setReadWrite(args.keys).build()
      : args.restorePreamble.transactionData.build()

    const options: OperationOptions.RestoreFootprint = {}

    const injectionParameter = { sorobanData: sorobanData }

    const restoreFootprintOperation = Operation.restoreFootprint(options)
    await this.sorobanTransactionPipeline.execute({
      txInvocation,
      operations: [restoreFootprintOperation],
      options: {
        executionPlugins: [
          new InjectPreprocessParameterPlugin<
            BuildTransactionPipelineInput,
            BuildTransactionPipelineOutput,
            BuildTransactionPipelineType,
            typeof injectionParameter
          >(injectionParameter, BuildTransactionPipelineType.id, 'preProcess'),
        ],
      },
    })

    return
  }
}
