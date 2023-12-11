import { ContractSpec, SorobanRpc as SorobanRpcNamespace } from 'soroban-client'

import { SorobanInvokeArgs, SorobanSimulateArgs } from '@core/contract-engine/types'
import { SorobanTransactionProcessor } from '@core/soroban-transaction-processor'
import { RpcHandler } from '@rpc/types'
import { Network } from '@stellar-plus/types'

export class ContractEngine extends SorobanTransactionProcessor {
  private spec: ContractSpec
  private contractId: string
  constructor(network: Network, spec: ContractSpec, contractId: string, rpcHandler?: RpcHandler) {
    super(network, rpcHandler)
    this.spec = spec
    this.contractId = contractId
  }

  //
  // Used to fetch data and state from the contract.
  //
  // This function simulates a transaction witht the RPC server
  // and verifies the result, extracting the output of the simulated
  // invocation.
  //
  // As it is a simulated invocation, there is no need to sign and submit
  // the transaction. These would only be required if the transaction
  // was to be submitted to the network to modify the state of the
  // contract in some way.
  //
  protected async readFromContract(args: SorobanSimulateArgs<object>): Promise<unknown> {
    const builtTx = await this.buildTransaction(args, this.spec, this.contractId)
    const simulated = await this.simulateTransaction(builtTx)

    const output = this.extractOutputFromSimulation(simulated, args.method)
    return output
  }

  //
  // Used to execute invocations and change state in the contract.
  //
  // This function builds a transaction, signs it, and submits it to the
  // network. It then extracts the output of the invocation from the
  // processed transaction.
  //
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
