import { ContractSpec, SorobanRpc as SorobanRpcNamespace, xdr } from 'soroban-client'

import { SorobanInvokeArgs, SorobanSimulateArgs } from '@core/contract-engine/types'
import { SorobanTransactionProcessor } from '@core/soroban-transaction-processor'
import { RpcHandler } from '@rpc/types'
import { Network } from '@stellar-plus/types'
import { EnvelopeHeader } from '@core/types'

export class ContractEngine extends SorobanTransactionProcessor {
  private spec: ContractSpec
  private contractId: string

  /**
   *
   * @param {Network} network - The network to use.
   * @param {ContractSpec} spec - The contract specification.
   * @param {string} contractId - The contract id.
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
  constructor(network: Network, spec: ContractSpec, contractId: string, rpcHandler?: RpcHandler) {
    super(network, rpcHandler)
    this.spec = spec
    this.contractId = contractId
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
    const builtTx = await this.buildTransaction(args, this.spec, this.contractId)
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
    const builtTx = await this.buildTransaction(args, this.spec, this.contractId)

    const prepared = await this.prepareTransaction(builtTx)

    const submitted = await this.processSorobanTransaction(prepared, args.signers, args.feeBump)

    const output = this.extractOutputFromProcessedInvocation(submitted, args.method)

    return output
  }

  private async extractOutputFromSimulation(
    simulated: SorobanRpcNamespace.SimulateTransactionResponse,
    method: string
  ): Promise<unknown> {
    const simulationResult = this.verifySimulationResult(simulated)
    const output = this.spec.funcResToNative(method, simulationResult.retval) as unknown
    return output
  }

  private async extractOutputFromProcessedInvocation(
    response: SorobanRpcNamespace.GetSuccessfulTransactionResponse,
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
    simulated: SorobanRpcNamespace.SimulateTransactionResponse
  ): SorobanRpcNamespace.SimulateHostFunctionResult {
    if (SorobanRpcNamespace.isSimulationError(simulated)) {
      throw new Error('Transaction Simulation Failed!')
    }
    if (SorobanRpcNamespace.isSimulationRestore(simulated)) {
      throw new Error('Transaction simulation indicates a restore is required!')
    }
    if (!SorobanRpcNamespace.isSimulationSuccess(simulated)) {
      throw new Error('Transaction Simulation not successful!')
    }
    if (!simulated.result) {
      throw new Error('No result in the simulation!')
    }

    return simulated.result as SorobanRpcNamespace.SimulateHostFunctionResult
  }
}
