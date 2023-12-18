import { randomBytes } from 'crypto'

import {
  Address,
  Contract,
  ContractSpec,
  FeeBumpTransaction,
  Operation,
  OperationOptions,
  SorobanRpc as SorobanRpcNamespace,
  Account as StellarAccount,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import {
  SorobanDeployArgs,
  SorobanSimulateArgs,
  SorobanUploadArgs,
  WrapClassicAssetArgs,
} from 'stellar-plus/core/soroban-transaction-processor/types'
import { FeeBumpHeader } from 'stellar-plus/core/types'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network, TransactionXdr } from 'stellar-plus/types'

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
    super({ network })
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
   * @returns {Promise<Transaction>} The Soroban transaction envelope.
   */
  protected async buildTransaction(
    args: SorobanSimulateArgs<object>,
    spec: ContractSpec,
    contractId: string
  ): Promise<Transaction> {
    const { method, methodArgs, header } = args

    const encodedArgs = spec.funcArgsToScVals(method, methodArgs)

    try {
      const sourceAccount = (await this.horizonHandler.loadAccount(header.source)) as StellarAccount
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
   * @param {Transaction} tx - The transaction to simulate.
   *
   * @description - Simulates the given transaction.
   *
   * @returns {Promise<SorobanRpcNamespace.SimulateTransactionResponse>} The simulation response.
   */
  protected async simulateTransaction(tx: Transaction): Promise<SorobanRpcNamespace.Api.SimulateTransactionResponse> {
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
   * @returns {Promise<Transaction>} Transaction prepared for submission.
   */
  protected async prepareTransaction(tx: Transaction): Promise<Transaction> {
    try {
      const response = await this.rpcHandler.prepareTransaction(tx)
      return response
    } catch (error) {
      console.log('tx: ', tx.toXDR())
      console.log('Error: ', error)
      throw new Error('Failed to prepare transaction!')
    }
  }

  /**
   *
   * @param {Transaction | FeeBumpTransaction} tx - The transaction to submit.
   *
   * @description - Submits the given transaction to the network.
   *
   * @returns {Promise<SorobanRpcNamespace.Api.SendTransactionResponse>} The response from the Soroban server.
   */
  protected async submitTransaction(
    tx: Transaction | FeeBumpTransaction
  ): Promise<SorobanRpcNamespace.Api.SendTransactionResponse> {
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
   * @param {Transaction} envelope - The prepared transaction envelope to sign.
   * @param {AccountHandler[]} signers - The signers to sign the transaction with.
   * @param {FeeBumpHeader=} feeBump - The fee bump header to use.
   *
   * @description - Signs the given transaction envelope with the provided signers and submits it to the network.
   *
   * @returns {Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse>} The response from the Soroban server.
   */
  protected async processSorobanTransaction(
    envelope: Transaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers)

    const finalEnvelope = feeBump
      ? ((await this.wrapSorobanFeeBump(signedInnerTransaction, feeBump)) as FeeBumpTransaction)
      : (TransactionBuilder.fromXDR(signedInnerTransaction, this.network.networkPassphrase) as Transaction)

    const rpcResponse = await this.submitTransaction(finalEnvelope)
    const processedTransaction = await this.postProcessSorobanSubmission(rpcResponse)

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
    response: SorobanRpcNamespace.Api.SendTransactionResponse
  ): Promise<SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse> {
    if (response.status === 'ERROR') {
      // console.log('Soroban transaction submission failed!: ', response.errorResult?.toXDR('raw').toString('base64'))
      throw new Error('Soroban transaction submission failed!')
    }

    if (response.status === 'PENDING' || response.status === 'TRY_AGAIN_LATER') {
      // console.log('Waiting for Transaction!: ')
      return await this.waitForTransaction(response.hash, 15) // Arbitrary 15 seconds timeout
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
  protected async waitForTransaction(
    transactionHash: string,
    secondsToWait: number
  ): Promise<SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse> {
    const timeout = secondsToWait * 1000
    const waitUntil = Date.now() + timeout
    const initialWaitTime = 1000
    let waitTime = initialWaitTime

    let updatedTransaction = await this.rpcHandler.getTransaction(transactionHash)
    while (
      Date.now() < waitUntil &&
      updatedTransaction.status === SorobanRpcNamespace.Api.GetTransactionStatus.NOT_FOUND
    ) {
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      updatedTransaction = await this.rpcHandler.getTransaction(transactionHash)
      waitTime *= 2 // Exponential backoff
    }

    if (updatedTransaction.status === SorobanRpcNamespace.Api.GetTransactionStatus.SUCCESS) {
      return updatedTransaction as SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
    }

    if (updatedTransaction.status === SorobanRpcNamespace.Api.GetTransactionStatus.FAILED) {
      // const failedTransaction = updatedTransaction as SorobanRpcNamespace.GetFailedTransactionResponse
      // console.log("Details!: ", JSON.stringify(failedTransaction));
      throw new Error('Transaction execution failed!')
    }

    throw new Error('Transaction execution not found!')
  }

  protected postProcessTransaction(
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
  ): SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse {
    //TODO: implement

    return response
  }

  /**
   *
   * @param {Transaction} envelopeXdr - The inner transaction envelope to wrap.
   * @param {FeeBumpHeader} feeBump - The fee bump header to use.
   *
   * @description - Wraps the given transaction envelope with the provided fee bump header.
   *
   * @returns {Promise<FeeBumpTransaction>} The wrapped transaction envelope.
   */
  protected async wrapSorobanFeeBump(envelopeXdr: TransactionXdr, feeBump: FeeBumpHeader): Promise<FeeBumpTransaction> {
    const tx = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase) as Transaction

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeBump.header.source,
      feeBump.header.fee,
      tx,
      this.network.networkPassphrase
    )

    const signedFeeBumpXDR = await this.signEnvelope(feeBumpTx, feeBump.signers)

    return TransactionBuilder.fromXDR(signedFeeBumpXDR, this.network.networkPassphrase) as FeeBumpTransaction
  }

  /**
   *
   * @args {SorobanUploadArgs} args - The arguments for the invocation.
   * @param {Buffer} args.wasm - The Buffer of the wasm file to upload.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   * @param {AccountHandler[]} args.signers - The signers for the transaction.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the transaction. This is optional.
   * @returns {Promise<string>} The wasm hash of the uploaded wasm.
   *
   * @description - Uploads a wasm file to the Soroban server and returns the wasm hash. This hash can be used to deploy new instances of the contract.
   */
  protected async uploadContractWasm(args: SorobanUploadArgs): Promise<string> {
    const { wasm, header, signers, feeBump } = args

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    const uploadOperation = [Operation.uploadContractWasm({ wasm })]

    const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(uploadOperation, txInvocation)

    const prepared = await this.prepareTransaction(builtTx)

    try {
      const output = await this.processSorobanTransaction(
        prepared,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )

      // Not using the returnValue parameter because it may not be available depending on the rpcHandler.
      return (output.resultMetaXdr.v3().sorobanMeta()?.returnValue().value() as Buffer).toString('hex') as string
    } catch (error) {
      // console.log('Error: ', error)
      throw new Error('Failed to upload contract!')
    }
  }

  /**
   *
   * @args {SorobanDeployArgs} args - The arguments for the invocation.
   * @param {string} args.wasmHash - The wasm hash of the contract to deploy.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   * @param {AccountHandler[]} args.signers - The signers for the transaction.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the transaction. This is optional.
   * @returns {Promise<string>} The contract Id of the deployed contract instance.
   *
   * @description - Deploys a new instance of the contract to the Soroban server and returns the contract id of the deployed contract instance.
   */
  protected async deployContract(args: SorobanDeployArgs): Promise<string> {
    const { wasmHash, header, signers, feeBump } = args

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    const options: OperationOptions.CreateCustomContract = {
      address: new Address(header.source),
      wasmHash: Buffer.from(wasmHash, 'hex'),
      salt: randomBytes(32),
    }

    const deployOperation = [Operation.createCustomContract(options)]

    const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(deployOperation, txInvocation)

    const prepared = await this.prepareTransaction(builtTx)

    try {
      const output = await this.processSorobanTransaction(
        prepared,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )
      // Not using the returnValue parameter because it may not be available depending on the rpcHandler.
      return Address.fromScAddress(
        output.resultMetaXdr.v3().sorobanMeta()?.returnValue().address() as xdr.ScAddress
      ).toString() as string
    } catch (error) {
      // console.log('Error: ', error)
      throw new Error('Failed to deploy contract instance!')
    }
  }

  /**
   * @args {WrapClassicAssetArgs} args - The arguments for the invocation.
   * @param {Asset} args.asset - The asset to wrap.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   * @param {AccountHandler[]} args.signers - The signers for the transaction.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the transaction. This is optional.
   * @returns {Promise<string>} The address of the wrapped asset contract.
   * @description - Wraps a classic asset on the Stellar network and returns the address of the wrapped asset contract.
   *
   **/
  protected async wrapClassicAsset(args: WrapClassicAssetArgs): Promise<string> {
    const { asset, header, signers, feeBump } = args

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    const options: OperationOptions.CreateStellarAssetContract = {
      asset,
    }

    const wrapOperation = [Operation.createStellarAssetContract(options)]

    const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(wrapOperation, txInvocation)

    const prepared = await this.prepareTransaction(builtTx)

    try {
      const output = await this.processSorobanTransaction(
        prepared,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )

      return Address.fromScAddress(output.returnValue?.address() as xdr.ScAddress).toString()
    } catch (error) {
      // console.log('Error: ', error)
      throw new Error('Failed to wrap asset contract!')
    }
  }

  //
  // There is something missing here...
  //
  //
  // public async extendFootprintTTL(args: ExtendFootprintTTLArgs): Promise<string> {
  //   const { extendTo, header, signers, feeBump } = args

  //   const txInvocation = {
  //     signers,
  //     header,
  //     feeBump,
  //   }

  //   const options: OperationOptions.ExtendFootprintTTL = {
  //     extendTo,
  //   }

  //   const extendTTLOperation = [Operation.extendFootprintTtl(options)]

  //   const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(extendTTLOperation, txInvocation)

  //   // const envelope = TransactionBuilder.cloneFrom(builtTx)
  //   // envelope.
  //   // const data = xdr.SorobanTransactionData
  //   // envelope.setSorobanData()

  //   const prepared = await this.prepareTransaction(builtTx)

  //   try {
  //     const output = await this.processSorobanTransaction(
  //       prepared,
  //       updatedTxInvocation.signers,
  //       updatedTxInvocation.feeBump
  //     )

  //     return output.returnValue?.value() as string
  //   } catch (error) {
  //     // console.log('Error: ', error)
  //     throw new Error('Failed to wrap asset contract!')
  //   }
  // }
}
