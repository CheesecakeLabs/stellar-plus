import { Contract, ContractSpec, SorobanRpc as SorobanRpcNamespace, Transaction, xdr } from '@stellar/stellar-sdk'

import { ContractEngineConstructorArgs, Options, TransactionResources } from 'stellar-plus/core/contract-engine/types'
import { SorobanTransactionProcessor } from 'stellar-plus/core/soroban-transaction-processor'
import {
  RestoreFootprintArgs,
  SorobanInvokeArgs,
  SorobanSimulateArgs,
  WrapClassicAssetArgs,
} from 'stellar-plus/core/soroban-transaction-processor/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { StellarPlusError } from 'stellar-plus/error'
import { StellarPlusErrorObject } from 'stellar-plus/error/types'

import { CEError, ContractEngineErrorCodes } from './errors'

export class ContractEngine extends SorobanTransactionProcessor {
  private spec: ContractSpec
  private contractId?: string
  private wasm?: Buffer
  private wasmHash?: string

  private options: Options = {
    debug: false,
    costHandler: defaultCostHandler,
  }

  /**
   *
   * @param {Network} network - The network to use.
   * @param {ContractSpec} spec - The contract specification.
   * @param {string=} contractId - The contract id.
   * @param {RpcHandler=} rpcHandler - A custom RPC handler to use when interacting with the network RPC server.
   * @param {Options=}  options - A set of custom options to modify the behavior of the contract engine.
   * @param {boolean=} options.debug - A flag to enable debug mode. This will toggle the extraction of transaction resources consumed with each transaction/simiulation.
   * @param {CostHandler=} options.costHandler - A custom function to handle the transaction resources consumed with each transaction/simulation. Whn not provided, the default cost handler will be used and the resources will be logged to the console.
   * @param {TransactionInvocation=} options.restoreTxInvocation - The transaction invocation object to use when automatically restoring the contract footprint. When this parameter is provided, whenever a simulation indicates that the contract footprint needs to be restored, the contract engine will automatically restore the footprint using the provided transaction invocation object.
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
    super(args.network, args.rpcHandler)
    this.spec = args.spec
    this.contractId = args.contractId
    this.wasm = args.wasm
    this.wasmHash = args.wasmHash
    this.options = { ...this.options, ...args.options }
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

  /**
   * 
   * @param {void} args - No arguments.
   * 
   * @returns {Promise<number>} The 'liveUntilLedgerSeq' value representing the ledger sequence number until which the contract instance is live.
   * 
   * @description - Returns the ledger sequence number until which the contract instance is live. When the contract instance is live, it can be invoked. When the liveUntilLedgerSeq is reached, the contract instance is archived and can no longer be invoked until a restore is performed.
   
   */
  public async getContractInstanceLiveUntilLedgerSeq(): Promise<number> {
    this.requireContractId()

    const footprint = this.getContractFootprint()

    const ledgerEntries = (await this.getRpcHandler().getLedgerEntries(
      footprint
    )) as SorobanRpcNamespace.Api.GetLedgerEntriesResponse

    const contractInstance = ledgerEntries.entries.find((entry) => entry.key.switch().name === 'contractData')

    if (!contractInstance) {
      throw CEError.contractInstanceNotFound(ledgerEntries)
    }
    if (!contractInstance.liveUntilLedgerSeq) {
      throw CEError.contractInstanceMissingLiveUntilLedgerSeq(ledgerEntries)
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
    this.requireWasmHash()

    const ledgerEntries = (await this.getRpcHandler().getLedgerEntries(
      xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: Buffer.from(this.getWasmHash(), 'hex') }))
    )) as SorobanRpcNamespace.Api.GetLedgerEntriesResponse

    const contractCode = ledgerEntries.entries.find((entry) => entry.key.switch().name === 'contractCode')

    if (!contractCode) {
      throw CEError.contractCodeNotFound(ledgerEntries)
    }
    if (!contractCode.liveUntilLedgerSeq) {
      throw CEError.contractCodeMissingLiveUntilLedgerSeq(ledgerEntries)
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
  protected async readFromContract(args: SorobanSimulateArgs<object>): Promise<unknown> {
    this.requireContractId()

    const startTime = Date.now()

    const builtTx = (await this.buildTransaction(args, this.spec, this.contractId!)) as Transaction // Contract Id verified in requireContractId
    const simulatedTransaction = await this.simulateTransaction(builtTx)

    const successfulSimulation = await this.verifySimulationResponse(simulatedTransaction)

    const costs = this.options.debug ? await this.parseTransactionResources(successfulSimulation) : {}

    const output = this.extractOutputFromSimulation(successfulSimulation, args.method)

    if (this.options.debug) {
      this.options.costHandler?.(args.method, costs, Date.now() - startTime, 0)
    }

    return output
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
  protected async invokeContract(args: SorobanInvokeArgs<object>): Promise<unknown> {
    this.requireContractId()

    const startTime = Date.now()

    const builtTx = await this.buildTransaction(args, this.spec, this.contractId!) // Contract Id verified in requireContractId

    const txInvocation = { ...args } as TransactionInvocation

    const { response, transactionResources } = await this.processBuiltTransaction({
      builtTx,
      updatedTxInvocation: txInvocation,
    })

    const output = this.extractOutputFromProcessedInvocation(response, args.method)

    if (this.options.debug) {
      const feeCharged = await this.extractFeeCharged(response)
      this.options.costHandler?.(
        args.method,
        transactionResources as TransactionResources,
        Date.now() - startTime,
        feeCharged
      )
    }

    return output
  }

  /**
   *
   * @param {SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse} simulatedTransaction - The simulated transaction response to parse.
   *
   * @returns {Promise<TransactionCosts>} The parsed transaction costs.
   *
   * @description - Parses the transaction costs from the simulated transaction response.
   *
   */
  private async parseTransactionResources(
    simulatedTransaction: SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse
  ): Promise<TransactionResources> {
    const calculateEventSize = (event: xdr.DiagnosticEvent): number => {
      if (event.event()?.type().name === 'diagnostic') {
        return 0
      }
      return event.toXDR().length
    }

    const sorobanTransactionData = simulatedTransaction.transactionData.build()
    const events = simulatedTransaction.events?.map((event) => calculateEventSize(event))
    const returnValueSize = simulatedTransaction.result?.retval.toXDR().length
    const transactionDataSize = sorobanTransactionData.toXDR().length
    const eventsSize = events?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    return {
      // cpuInstructions: Number(simulatedTransaction.cost?.cpuInsns),
      cpuInstructions: Number(sorobanTransactionData?.resources().instructions()),
      ram: Number(simulatedTransaction.cost?.memBytes),
      minResourceFee: Number(simulatedTransaction.minResourceFee),
      ledgerReadBytes: sorobanTransactionData?.resources().readBytes(),
      ledgerWriteBytes: sorobanTransactionData?.resources().writeBytes(),
      ledgerEntryReads: sorobanTransactionData?.resources().footprint().readOnly().length,
      ledgerEntryWrites: sorobanTransactionData?.resources().footprint().readWrite().length,
      eventSize: eventsSize,
      returnValueSize: returnValueSize,
      transactionSize: transactionDataSize,
    }
  }

  private async extractFeeCharged(tx: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse): Promise<number> {
    return Number(tx.resultXdr.feeCharged())
  }

  private async extractOutputFromSimulation(
    simulated: SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse,
    method: string
  ): Promise<unknown> {
    if (!simulated.result) {
      throw CEError.simulationMissingResult(simulated)
    }

    const output = this.spec.funcResToNative(method, simulated.result.retval) as unknown
    return output
  }

  private async extractOutputFromProcessedInvocation(
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse,
    method: string
  ): Promise<unknown> {
    // console.log('Response: ', response)
    const invocationResultMetaXdr = response.resultMetaXdr
    const output = this.spec.funcResToNative(
      method,
      invocationResultMetaXdr.v3().sorobanMeta()?.returnValue().toXDR('base64') as string
    ) as unknown
    return output
  }

  private async verifySimulationResponse(
    simulated: SorobanRpcNamespace.Api.SimulateTransactionResponse
  ): Promise<SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse> {
    if (SorobanRpcNamespace.Api.isSimulationError(simulated)) {
      throw CEError.simulationFailed(simulated)
    }

    // Simulated transactions with restore status are simulated as if
    // the restore was done already. This means that the simulation
    // result will come as successful. Therefore, we need to restore
    // the footprint and proceed as if it was successful.
    // Here, if no auto restor is set, we throw an error as the
    // execution cannot proceed.
    if (SorobanRpcNamespace.Api.isSimulationRestore(simulated)) {
      throw CEError.transactionNeedsRestore(simulated)
      // if (this.options.restoreTxInvocation) {
      //   await this.autoRestoreFootprintFromFromSimulation(simulated, originalTx)
      //   // Bump sequence number if same account is used for restore
      // } else {

      // }
    }

    if (SorobanRpcNamespace.Api.isSimulationSuccess(simulated) && simulated.result) {
      return simulated as SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse
    }

    if (SorobanRpcNamespace.Api.isSimulationSuccess(simulated) && !simulated.result) {
      throw CEError.simulationMissingResult(simulated)
    }

    throw CEError.couldntVerifyTransactionSimulation(simulated)
  }

  private async autoRestoreFootprintFromFromSimulation(
    simulation: SorobanRpcNamespace.Api.SimulateTransactionRestoreResponse,
    originalTx: Transaction
  ): Promise<Transaction> {
    if (!this.options.restoreTxInvocation) {
      throw CEError.restoreOptionNotSet(simulation)
    }
    const restorePreamble = simulation.restorePreamble

    await this.restoreFootprint({ restorePreamble, ...this.options.restoreTxInvocation } as RestoreFootprintArgs)

    if (originalTx.source === this.options.restoreTxInvocation.header.source) {
      originalTx.sequence = (BigInt(originalTx.sequence) + BigInt(1)).toString()
    }
    return originalTx
  }

  //==========================================
  // Meta Management Methods
  //==========================================
  //
  //

  private async processBuiltTransaction(args: {
    builtTx: Transaction
    updatedTxInvocation: TransactionInvocation
  }): Promise<{
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
    transactionResources?: TransactionResources
  }> {
    const { updatedTxInvocation } = args

    let { builtTx } = args

    const simulatedTransaction = await this.simulateTransaction(builtTx)

    let successfulSimulation: SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse

    try {
      successfulSimulation = await this.verifySimulationResponse(simulatedTransaction)
    } catch (error: unknown) {
      const spError = error as StellarPlusErrorObject
      if (spError.code === ContractEngineErrorCodes.CE102) {
        // Transaction needs Restore
        if (this.options.restoreTxInvocation) {
          builtTx = await this.autoRestoreFootprintFromFromSimulation(
            simulatedTransaction as SorobanRpcNamespace.Api.SimulateTransactionRestoreResponse,
            builtTx
          )

          successfulSimulation = simulatedTransaction as SorobanRpcNamespace.Api.SimulateTransactionSuccessResponse
        } else {
          throw CEError.restoreOptionNotSet(
            simulatedTransaction as SorobanRpcNamespace.Api.SimulateTransactionRestoreResponse
          )
        }
      } else {
        throw error
      }
    }

    const transactionResources = this.options.debug ? await this.parseTransactionResources(successfulSimulation) : {}

    const assembledTransaction = await this.assembleTransaction(builtTx, successfulSimulation)

    return {
      response: await this.processSorobanTransaction(
        assembledTransaction,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      ),
      transactionResources,
    }
  }

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

    const startTime = Date.now()
    const builtTransactionObjectToProcess = await this.buildUploadContractWasmTransaction({
      wasm: this.wasm!, // Wasm verified in requireWasm
      ...txInvocation,
    })

    try {
      const { response, transactionResources } = await this.processBuiltTransaction(builtTransactionObjectToProcess)
      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      const wasmHash = this.extractWasmHashFromUploadWasmResponse(response)
      this.wasmHash = wasmHash

      if (this.options.debug) {
        this.options.costHandler?.(
          'uploadWasm',
          transactionResources as TransactionResources,
          Date.now() - startTime,
          await this.extractFeeCharged(response)
        )
      }
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
    const startTime = Date.now()

    const builtTransactionObjectToProcess = await this.buildDeployContractTransaction({
      wasmHash: this.wasmHash!, // Wasm hash verified in requireWasmHash
      ...txInvocation,
    })

    try {
      const { response, transactionResources } = await this.processBuiltTransaction(builtTransactionObjectToProcess)
      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      const contractId = this.extractContractIdFromDeployContractResponse(response)

      this.contractId = contractId

      if (this.options.debug) {
        this.options.costHandler?.(
          'deployWasm',
          transactionResources as TransactionResources,
          Date.now() - startTime,
          await this.extractFeeCharged(response)
        )
      }
    } catch (error) {
      throw CEError.failedToDeployContract(error as StellarPlusError)
    }
  }

  public async wrapAndDeployClassicAsset(args: WrapClassicAssetArgs): Promise<void> {
    this.requireNoContractId()
    const startTime = Date.now()

    const builtTransactionObjectToProcess = await this.buildWrapClassicAssetTransaction(args)

    try {
      const { response, transactionResources } = await this.processBuiltTransaction(builtTransactionObjectToProcess)
      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      const contractId = this.extractContractIdFromWrapClassicAssetResponse(response)

      this.contractId = contractId

      if (this.options.debug) {
        this.options.costHandler?.(
          'wrapSAC',
          transactionResources as TransactionResources,
          Date.now() - startTime,
          await this.extractFeeCharged(response)
        )
      }
    } catch (error) {
      throw CEError.failedToWrapAsset(error as StellarPlusError)
    }
  }

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation object to use in this transaction.
   *
   * @returns {Promise<void>} - The output of the invocation.
   *
   * @description - Restores the contract instance footprint.
   */
  public async restoreContractFootprint(txInvocation: TransactionInvocation): Promise<void> {
    const footprint = this.getContractFootprint()

    return await this.restoreFootprint({ ...txInvocation, keys: [footprint] }) // Contract Id verified in requireContractId
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
}

function defaultCostHandler(
  methodName: string,
  costs: TransactionResources,
  elapsedTime: number,
  feeCharged: number
): void {
  console.log('Debugging method: ', methodName)
  console.log(costs)
  console.log('Fee charged: ', feeCharged)
  console.log('Elapsed time: ', elapsedTime)
}
