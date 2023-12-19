import { ContractSpec, SorobanRpc as SorobanRpcNamespace, Transaction, xdr } from '@stellar/stellar-sdk'

import { ContractEngineConstructorArgs, TransactionCosts } from 'stellar-plus/core/contract-engine/types'
import { SorobanTransactionProcessor } from 'stellar-plus/core/soroban-transaction-processor'
import {
  SorobanInvokeArgs,
  SorobanSimulateArgs,
  WrapClassicAssetArgs,
} from 'stellar-plus/core/soroban-transaction-processor/types'
import { TransactionInvocation } from 'stellar-plus/core/types'

export class ContractEngine extends SorobanTransactionProcessor {
  private spec: ContractSpec
  private contractId?: string
  private wasm?: Buffer
  private wasmHash?: string
  private options: {
    debug: boolean;
    costHandler: (methodName: string, costs: TransactionCosts) => void;
  } = {
      debug: false,
      costHandler: defaultCostHandler
    };

  /**
   *
   * @param {Network} network - The network to use.
   * @param {ContractSpec} spec - The contract specification.
   * @param {string=} contractId - The contract id.
   * @param {RpcHandler=} rpcHandler - The rpc handler to use.
   *
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
    this.options = { ...this.options, ...args.options };
    console.log(args.options, this.options)
  }

  public getContractId(): string | undefined {
    return this.contractId
  }

  public getWasm(): Buffer | undefined {
    return this.wasm
  }

  public getWasmHash(): string | undefined {
    return this.wasmHash
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

    const builtTx = (await this.buildTransaction(args, this.spec, this.contractId!)) as Transaction // Contract Id verified in requireContractId
    const simulated = await this.simulateTransaction(builtTx)

    const output = this.extractOutputFromSimulation(simulated, args.method)
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

    const builtTx = await this.buildTransaction(args, this.spec, this.contractId!) // Contract Id verified in requireContractId

    if (this.options.debug) {
      const costs = await this.parseTransactionCosts(builtTx)
      this.options.costHandler?.(args.method, costs);
    }

    const prepared = await this.prepareTransaction(builtTx)

    const submitted = (await this.processSorobanTransaction(
      prepared,
      args.signers,
      args.feeBump
    )) as SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse

    const output = this.extractOutputFromProcessedInvocation(submitted, args.method)

    return output
  }

  private async parseTransactionCosts(
    tx: Transaction,
  ): Promise<TransactionCosts> {
    const simulated = await this._simulateTransaction(tx)

    const calculateEventSize = (event: any) => {
      const parsedEvent = xdr.DiagnosticEvent.fromXDR(event, 'base64');

      if (parsedEvent.event().type().name === 'diagnostic') {
        return 0;
      }

      return parsedEvent.toXDR().length;
    };

    const sorobanTransactionData = simulated.transactionData ? xdr.SorobanTransactionData.fromXDR(simulated.transactionData, 'base64') : null;
    const events = simulated.events?.map((event) => calculateEventSize(event));
    const returnValueXDR = simulated.results ? simulated.results[0].xdr : "";
    const transactionDataXDR = simulated.transactionData || "";

    const eventsSize = events?.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const returnValueSize = Buffer.from(returnValueXDR, 'base64').length;
    const transactionDataSize = Buffer.from(transactionDataXDR, 'base64').length;

    return {
      cpuInstructions: Number(simulated.cost?.cpuInsns),
      ram: Number(simulated.cost?.memBytes),
      minResourceFee: simulated.minResourceFee,
      ledgerReadBytes: sorobanTransactionData?.resources().readBytes(),
      ledgerWriteBytes: sorobanTransactionData?.resources().writeBytes(),
      ledgerEntryReads: sorobanTransactionData?.resources().footprint().readOnly().length,
      ledgerEntryWrites: sorobanTransactionData?.resources().footprint().readWrite().length,
      eventSize: eventsSize,
      returnValueSize: returnValueSize,
      transactionSize: transactionDataSize,
    };
  }

  private async extractOutputFromSimulation(
    simulated: SorobanRpcNamespace.Api.SimulateTransactionResponse,
    method: string
  ): Promise<unknown> {
    const simulationResult = this.verifySimulationResult(simulated)
    const output = this.spec.funcResToNative(method, simulationResult.retval) as unknown
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

  private verifySimulationResult(
    simulated: SorobanRpcNamespace.Api.SimulateTransactionResponse
  ): SorobanRpcNamespace.Api.SimulateHostFunctionResult {
    if (SorobanRpcNamespace.Api.isSimulationError(simulated)) {
      throw new Error('Transaction Simulation Failed!')
    }
    if (SorobanRpcNamespace.Api.isSimulationRestore(simulated)) {
      throw new Error('Transaction simulation indicates a restore is required!')
    }
    if (!SorobanRpcNamespace.Api.isSimulationSuccess(simulated)) {
      throw new Error('Transaction Simulation not successful!')
    }
    if (!simulated.result) {
      throw new Error('No result in the simulation!')
    }

    return simulated.result as SorobanRpcNamespace.Api.SimulateHostFunctionResult
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

    const wasmHash = await this.uploadContractWasm({ wasm: this.wasm!, ...txInvocation }) // Wasm verified in requireWasm

    this.wasmHash = wasmHash
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

    const contractId = await this.deployContract({ wasmHash: this.wasmHash!, ...txInvocation }) // Wasm hash verified in requireWasmHash

    this.contractId = contractId
  }

  public async wrapAndDeployClassicAsset(args: WrapClassicAssetArgs): Promise<void> {
    const contractId = await this.wrapClassicAsset(args)
    this.contractId = contractId
  }

  //==========================================
  // Internal Methods
  //==========================================
  //
  //

  private requireContractId(): void {
    if (!this.contractId) {
      throw new Error('Contract id not set!')
    }
  }

  private requireWasm(): void {
    if (!this.wasm) {
      throw new Error('Wasm not set!')
    }
  }

  private requireWasmHash(): void {
    if (!this.wasmHash) {
      throw new Error('Wasm hash not set!')
    }
  }
}

function defaultCostHandler(methodName: string, costs: TransactionCosts): void {
  console.log("Debugging method: ", methodName)
  console.log(costs);
}