import { Contract, ContractSpec, SorobanRpc as SorobanRpcNamespace, TransactionBuilder } from 'soroban-client'

import { AccountHandler } from '@account/account-handler/types'
import { TransactionProcessor } from '@core/classic-transaction-processor'
import { SorobanSimulateArgs } from '@core/contract-engine/types'
import { FeeBumpHeader } from '@core/types'
import { DefaultRpcHandler } from '@rpc/default-handler'
import { RpcHandler } from '@rpc/types'
import {
  FeeBumpTransaction,
  Network,
  SorobanFeeBumpTransaction,
  SorobanTransaction,
  TransactionXdr,
} from '@stellar-plus/types'

export class SorobanTransactionProcessor extends TransactionProcessor {
  private rpcHandler: RpcHandler

  /**
   *
   * @param {Network} network - The network to use.
   * @param {RpcHandler=} rpcHandler - The rpc handler to use.
   *
   * @description - The Soroban transaction processor is used for handling Soroban transactions and submitting them to the network.
   *
   */
  constructor(network: Network, rpcHandler?: RpcHandler) {
    super(network)
    this.rpcHandler = rpcHandler || new DefaultRpcHandler(network)
  }

  /**
   * @args {SorobanSimulateArgs<object>} args - The arguments for the invocation.
   * @param {string} args.method - The method to invoke as it is identified in the contract.
   * @param {object} args.methodArgs - The arguments for the method invocation.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   *
   * @arg {ContractSpec} spec - The contract specification.
   * @arg {string} contractId - The contract id.
   *
   * @description - Builds a Soroban transaction envelope.
   *
   * @returns {Promise<SorobanTransaction>} The Soroban transaction envelope.
   */
  protected async buildTransaction(
    args: SorobanSimulateArgs<object>,
    spec: ContractSpec,
    contractId: string
  ): Promise<SorobanTransaction> {
    const { method, methodArgs, header } = args

    const encodedArgs = spec.funcArgsToScVals(method, methodArgs)

    try {
      const sourceAccount = await this.horizonHandler.loadAccount(header.source)
      const contract = new Contract(contractId)
      const txEnvelope = new TransactionBuilder(sourceAccount, {
        fee: header.fee,
        networkPassphrase: this.network.networkPassphrase,
      })
        .addOperation(contract.call(method, ...encodedArgs))
        .setTimeout(header.timeout)
        .build()

      return txEnvelope
    } catch (error) {
      throw new Error('Failed to build transaction!')
    }
  }

  /**
   *
   * @param {SorobanTransaction} tx - The transaction to simulate.
   *
   * @description - Simulates the given transaction.
   *
   * @returns {Promise<SorobanRpcNamespace.SimulateTransactionResponse>} The simulation response.
   */
  protected async simulateTransaction(
    tx: SorobanTransaction
  ): Promise<SorobanRpcNamespace.SimulateTransactionResponse> {
    try {
      const response = await this.rpcHandler.simulateTransaction(tx)
      return response
    } catch (error) {
      throw new Error('Failed to simulate transaction!')
    }
  }

  /**
   *
   * @param {SorobanRpcNamespace.SimulateTransactionResponse} simulationResponse - The simulation response.
   * @param {string} method - The method that was invoked.
   *
   * @description - Simulates the given transaction and assembles the output of the simulation for later submission.
   *
   * @returns {Promise<SorobanTransaction>} Transaction prepared for submission.
   */
  protected async prepareTransaction(tx: SorobanTransaction): Promise<SorobanTransaction> {
    try {
      const response = await this.rpcHandler.prepareTransaction(tx)
      return response
    } catch (error) {
      // console.log('Error: ', error)
      throw new Error('Failed to prepare transaction!')
    }
  }

  /**
   *
   * @param {SorobanTransaction | SorobanFeeBumpTransaction} tx - The transaction to submit.
   *
   * @description - Submits the given transaction to the network.
   *
   * @returns {Promise<SorobanRpcNamespace.SendTransactionResponse>} The response from the Soroban server.
   */
  protected async submitSorobanTransaction(
    tx: SorobanTransaction | SorobanFeeBumpTransaction
  ): Promise<SorobanRpcNamespace.SendTransactionResponse> {
    // console.log('Submitting transaction: ', tx.toXDR())
    try {
      const response = await this.rpcHandler.submitTransaction(tx)
      return response
    } catch (error) {
      throw new Error('Failed to submit transaction!')
    }
  }

  /**
   *
   * @param {SorobanTransaction} envelope - The prepared transaction envelope to sign.
   * @param {AccountHandler[]} signers - The signers to sign the transaction with.
   * @param {FeeBumpHeader=} feeBump - The fee bump header to use.
   *
   * @description - Signs the given transaction envelope with the provided signers and submits it to the network.
   *
   * @returns {Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse>} The response from the Soroban server.
   */
  protected async processSorobanTransaction(
    envelope: SorobanTransaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers)

    const finalEnvelope = feeBump
      ? ((await this.wrapSorobanFeeBump(signedInnerTransaction, feeBump)) as SorobanFeeBumpTransaction)
      : (TransactionBuilder.fromXDR(signedInnerTransaction, this.network.networkPassphrase) as SorobanTransaction)

    const rpcResponse = await this.submitSorobanTransaction(finalEnvelope)
    const processedTransaction = this.postProcessSorobanSubmission(rpcResponse)
    return processedTransaction
  }

  /**
   *
   * @param {SorobanRpcNamespace.SendTransactionResponse} response - The response from the Soroban server.
   *
   * @description - Processes the given Soroban transaction submission response.
   *
   * @returns {Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse>} The response from the Soroban server.
   */
  protected async postProcessSorobanSubmission(
    response: SorobanRpcNamespace.SendTransactionResponse
  ): Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse> {
    if (response.status === 'ERROR') {
      // console.log('Soroban transaction submission failed!: ', response.errorResult?.toXDR('raw').toString('base64'))
      throw new Error('Soroban transaction submission failed!')
    }

    if (response.status === 'PENDING' || response.status === 'TRY_AGAIN_LATER') {
      // console.log('Waiting for Transaction!: ')
      return await this.waitForSorobanTransaction(response.hash, 15) // Arbitrary 15 seconds timeout
    }

    throw new Error('Soroban transaction submission failed!')
  }

  /**
   *
   * @param {string} transactionHash - The hash of the transaction to wait for.
   * @param {number} secondsToWait - The number of seconds to wait before timing out. Defaults to 15 seconds.
   *
   *
   * @description - Waits for the given transaction to be processed by the Soroban server.
   * Soroban transactions are processed asynchronously, so this method will wait for the transaction to be processed.
   * If the transaction is not processed within the given timeout, it will throw an error.
   * If the transaction is processed, it will return the response from the Soroban server.
   * If the transaction fails, it will throw an error.
   * @returns {Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse>} The response from the Soroban server.
   */
  protected async waitForSorobanTransaction(
    transactionHash: string,
    secondsToWait: number
  ): Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse> {
    const timeout = secondsToWait * 1000
    const waitUntil = Date.now() + timeout
    const initialWaitTime = 1000
    let waitTime = initialWaitTime

    let updatedTransaction = await this.rpcHandler.getTransaction(transactionHash)
    while (Date.now() < waitUntil && updatedTransaction.status === SorobanRpcNamespace.GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      updatedTransaction = await this.rpcHandler.getTransaction(transactionHash)
      waitTime *= 2 // Exponential backoff
    }

    if (updatedTransaction.status === SorobanRpcNamespace.GetTransactionStatus.SUCCESS) {
      return updatedTransaction as SorobanRpcNamespace.GetSuccessfulTransactionResponse
    }

    if (updatedTransaction.status === SorobanRpcNamespace.GetTransactionStatus.FAILED) {
      // const failedTransaction = updatedTransaction as SorobanRpcNamespace.GetFailedTransactionResponse
      // console.log("Details!: ", JSON.stringify(failedTransaction));
      throw new Error('Transaction execution failed!')
    }

    throw new Error('Transaction execution not found!')
  }

  protected postProcessSorobanTransaction(
    response: SorobanRpcNamespace.GetSuccessfulTransactionResponse
  ): SorobanRpcNamespace.GetSuccessfulTransactionResponse {
    //TODO: implement

    return response
  }

  /**
   *
   * @param {SorobanTransaction} envelopeXdr - The inner transaction envelope to wrap.
   * @param {FeeBumpHeader} feeBump - The fee bump header to use.
   *
   * @description - Wraps the given transaction envelope with the provided fee bump header.
   *
   * @returns {Promise<FeeBumpTransaction>} The wrapped transaction envelope.
   */
  protected async wrapSorobanFeeBump(envelopeXdr: TransactionXdr, feeBump: FeeBumpHeader): Promise<FeeBumpTransaction> {
    const tx = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase) as SorobanTransaction

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeBump.header.source,
      feeBump.header.fee,
      tx,
      this.network.networkPassphrase
    )

    const signedFeeBumpXDR = await this.signEnvelope(feeBumpTx, feeBump.signers)

    return TransactionBuilder.fromXDR(signedFeeBumpXDR, this.network.networkPassphrase) as FeeBumpTransaction
  }
}
