import {
  Address,
  Contract,
  ContractSpec,
  FeeBumpTransaction,
  Operation,
  OperationOptions,
  SorobanDataBuilder,
  SorobanRpc as SorobanRpcNamespace,
  Account as StellarAccount,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'
import { assembleTransaction } from '@stellar/stellar-sdk/lib/soroban'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import {
  RestoreFootprintArgs,
  RestoreFootprintWithLedgerKeys,
  RestoreFootprintWithRestorePreamble,
  SorobanDeployArgs,
  SorobanSimulateArgs,
  SorobanUploadArgs,
  WrapClassicAssetArgs,
  isRestoreFootprintWithLedgerKeys,
} from 'stellar-plus/core/soroban-transaction-processor/types'
import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/core/types'
import { StellarPlusError } from 'stellar-plus/error'
import { SorobanOpCodes } from 'stellar-plus/error/helpers/result-meta-xdr'
import { GetTransactionSuccessErrorInfo, extractGetTransactionData } from 'stellar-plus/error/helpers/soroban-rpc'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network, TransactionXdr } from 'stellar-plus/types'
import { generateRandomSalt } from 'stellar-plus/utils/functions'

import { STPError } from './errors'

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
    } catch (e) {
      throw STPError.failedToBuildTransaction(e as Error, header)
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
    } catch (e) {
      throw STPError.failedToSimulateTransaction(e as Error, tx)
    }
  }

  protected async assembleTransaction(
    rawTransaction: Transaction,
    simulatedTransaction: SorobanRpcNamespace.Api.SimulateTransactionResponse
  ): Promise<Transaction> {
    try {
      const response = assembleTransaction(rawTransaction, simulatedTransaction)
      return response.build()
    } catch (e) {
      throw STPError.failedToAssembleTransaction(e as Error, rawTransaction, simulatedTransaction)
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
    } catch (e) {
      throw STPError.failedToSubmitTransaction(e as Error, tx)
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
      throw STPError.failedToSubmitTransactionWithResponse(response)
    }

    if (response.status === 'PENDING' || response.status === 'TRY_AGAIN_LATER') {
      // console.log('Waiting for Transaction!: ')
      return await this.waitForTransaction(response.hash, 15) // Arbitrary 15 seconds timeout
    }

    throw STPError.failedToVerifyTransactionSubmission(response)
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
      throw STPError.transactionSubmittedFailed(updatedTransaction)
    }

    throw STPError.transactionSubmittedNotFound(updatedTransaction, timeout)
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
   * @description - Builds a transaction to upload a wasm file to the Soroban server.
   */
  protected async buildUploadContractWasmTransaction(args: SorobanUploadArgs): Promise<{
    builtTx: Transaction
    updatedTxInvocation: TransactionInvocation
  }> {
    const { wasm, header, signers, feeBump } = args

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    const uploadOperation = [Operation.uploadContractWasm({ wasm })]
    return await this.buildCustomTransaction(uploadOperation, txInvocation)
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
    const { builtTx, updatedTxInvocation } = await this.buildUploadContractWasmTransaction(args)

    const simulatedTransaction = await this.simulateTransaction(builtTx)
    const assembledTransaction = await this.assembleTransaction(builtTx, simulatedTransaction)

    try {
      const output = await this.processSorobanTransaction(
        assembledTransaction,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )

      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      return this.extractWasmHashFromUploadWasmResponse(output)
    } catch (error) {
      throw STPError.failedToUploadWasm(error as StellarPlusError)
    }
  }

  protected extractWasmHashFromUploadWasmResponse(
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
  ): string {
    return (response.resultMetaXdr.v3().sorobanMeta()?.returnValue().value() as Buffer).toString('hex') as string
  }

  protected async buildDeployContractTransaction(
    args: SorobanDeployArgs
  ): Promise<{ builtTx: Transaction; updatedTxInvocation: TransactionInvocation }> {
    const { wasmHash, header, signers, feeBump } = args

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    const options: OperationOptions.CreateCustomContract = {
      address: new Address(header.source),
      wasmHash: Buffer.from(wasmHash, 'hex'),
      salt: generateRandomSalt(),
    }

    const deployOperation = [Operation.createCustomContract(options)]

    return await this.buildCustomTransaction(deployOperation, txInvocation)
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
    const { builtTx, updatedTxInvocation } = await this.buildDeployContractTransaction(args)

    const simulatedTransaction = await this.simulateTransaction(builtTx)
    const assembledTransaction = await this.assembleTransaction(builtTx, simulatedTransaction)

    try {
      const output = await this.processSorobanTransaction(
        assembledTransaction,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )
      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      return this.extractContractIdFromDeployContractResponse(output)
    } catch (error) {
      throw STPError.failedToDeployContract(error as StellarPlusError)
    }
  }
  protected extractContractIdFromDeployContractResponse(
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
  ): string {
    return Address.fromScAddress(
      response.resultMetaXdr.v3().sorobanMeta()?.returnValue().address() as xdr.ScAddress
    ).toString() as string
  }

  /**
   * @args {WrapClassicAssetArgs} args - The arguments for the invocation.
   * @param {Asset} args.asset - The asset to wrap.
   * @param {EnvelopeHeader} args.header - The header for the transaction.
   * @param {AccountHandler[]} args.signers - The signers for the transaction.
   * @param {FeeBumpHeader=} args.feeBump - The fee bump header for the transaction. This is optional.
   *
   * @returns {Promise<{ builtTx: Transaction; updatedTxInvocation: TransactionInvocation }>} The built transaction and updated transaction invocation.
   *
   * @description - Builds a transaction to wrap a classic asset on the Stellar network.
   * */
  protected async buildWrapClassicAssetTransaction(
    args: WrapClassicAssetArgs
  ): Promise<{ builtTx: Transaction; updatedTxInvocation: TransactionInvocation }> {
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

    return await this.buildCustomTransaction(wrapOperation, txInvocation)
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
    const { builtTx, updatedTxInvocation } = await this.buildWrapClassicAssetTransaction(args)

    const simulatedTransaction = await this.simulateTransaction(builtTx)
    const assembledTransaction = await this.assembleTransaction(builtTx, simulatedTransaction)

    try {
      const output = await this.processSorobanTransaction(
        assembledTransaction,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )
      // Not using the root returnValue parameter because it may not be available depending on the rpcHandler.
      return this.extractContractIdFromWrapClassicAssetResponse(output)
    } catch (error) {
      throw STPError.failedToWrapAsset(error as StellarPlusError)
    }
  }

  protected extractContractIdFromWrapClassicAssetResponse(
    response: SorobanRpcNamespace.Api.GetSuccessfulTransactionResponse
  ): string {
    return Address.fromScAddress(
      response.resultMetaXdr.v3().sorobanMeta()?.returnValue().address() as xdr.ScAddress
    ).toString()
  }

  // This functions can be invoked with two different sets of arguments. The first set is when the keys are provided directly.
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
  public async restoreFootprint(args: RestoreFootprintArgs): Promise<void> {
    const { header, signers, feeBump } = args

    const sorobanData = isRestoreFootprintWithLedgerKeys(args)
      ? new SorobanDataBuilder().setReadWrite(args.keys).build()
      : args.restorePreamble.transactionData.build()

    const txInvocation = {
      signers,
      header,
      feeBump,
    }

    // const options: OperationOptions.ExtendFootprintTTL = {
    //   extendTo,
    // }

    const options: OperationOptions.RestoreFootprint = {}
    // const extendTTLOperation = [Operation.extendFootprintTtl(options)]
    const restoreFootprintOperation = [Operation.restoreFootprint(options)]

    const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(restoreFootprintOperation, txInvocation)

    const builtTxWithFootprint = TransactionBuilder.cloneFrom(builtTx).setSorobanData(sorobanData).build()

    const simulatedTransaction = await this.simulateTransaction(builtTxWithFootprint)
    const assembledTransaction = await this.assembleTransaction(builtTxWithFootprint, simulatedTransaction)

    try {
      const output = await this.processSorobanTransaction(
        assembledTransaction,
        updatedTxInvocation.signers,
        updatedTxInvocation.feeBump
      )

      // Verify if successfully restored. The returnValue parameter is not trustworthy because it can carry a false flag even with success restore.
      if (
        (extractGetTransactionData(output) as GetTransactionSuccessErrorInfo).opCode ===
        SorobanOpCodes.restoreFootprintSuccess
      ) {
        return // Success
      }

      throw STPError.failedToRestoreFootprintWithResponse(output, assembledTransaction)
    } catch (error) {
      throw STPError.failedToRestoreFootprintWithError(error as StellarPlusError, assembledTransaction)
    }
  }
}
