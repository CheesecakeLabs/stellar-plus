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

  constructor(network: Network, rpcHandler?: RpcHandler) {
    super(network)
    this.rpcHandler = rpcHandler || new DefaultRpcHandler(network)
  }

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
  protected async prepareTransaction(tx: SorobanTransaction): Promise<SorobanTransaction> {
    try {
      const response = await this.rpcHandler.prepareTransaction(tx)
      return response
    } catch (error) {
      throw new Error('Failed to prepare transaction!')
    }
  }

  protected async submitSorobanTransaction(
    tx: SorobanTransaction | SorobanFeeBumpTransaction
  ): Promise<SorobanRpcNamespace.SendTransactionResponse> {
    console.log('Submitting transaction: ', tx.toXDR())
    try {
      const response = await this.rpcHandler.submitTransaction(tx)
      return response
    } catch (error) {
      throw new Error('Failed to submit transaction!')
    }
  }

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

  //
  // Soroban submissions might take a while to be processed.
  // This method waits for the transaction until we get
  // a final response from Soroban or until timeout is reached.
  //
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

  //
  // Exoponential backoff to wait for Soroban transaction to be processed
  // starts at 1 second and doubles each time until timeout is reached.
  //
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
