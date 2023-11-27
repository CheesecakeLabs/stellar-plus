import { AccountHandler } from "../../account/account-handler/types";
import { RpcHandler } from "../../rpc/types";
import { SorobanHandlerClient } from "../../soroban";
import { SorobanHandler } from "../../soroban/types";
import {
  FeeBumpTransaction,
  Network,
  SorobanFeeBumpTransaction,
  SorobanTransaction,
  TransactionXdr,
} from "../../types";
import { TransactionProcessor } from "../classic-transaction-processor";
import { SorobanSimulateArgs } from "../contract-engine/types";
import {
  ContractSpec,
  Contract,
  TransactionBuilder,
  SorobanRpc as SorobanRpcNamespace,
} from "soroban-client";
import { FeeBumpHeader } from "../types";

export class SorobanTransactionProcessor extends TransactionProcessor {
  private sorobanHandler: SorobanHandler;
  private rpcHandler: RpcHandler;

  constructor(network: Network, rpcHandler: RpcHandler) {
    super(network);
    this.sorobanHandler = new SorobanHandlerClient(network);
    this.rpcHandler = rpcHandler;
  }

  protected async buildTransaction(
    args: SorobanSimulateArgs<any>,
    spec: ContractSpec,
    contractId: string
  ): Promise<SorobanTransaction> {
    const { method, methodArgs, header } = args;
    const encodedArgs = spec.funcArgsToScVals(method, methodArgs);

    try {
      const sourceAccount = await this.horizonHandler.loadAccount(
        header.source
      );
      const contract = new Contract(contractId);

      const txEnvelope = new TransactionBuilder(sourceAccount, {
        fee: header.fee,
        networkPassphrase: this.network.networkPassphrase,
      })
        .addOperation(contract.call(method, ...encodedArgs))
        .setTimeout(header.timeout)
        .build();

      return txEnvelope;
    } catch (error) {
      throw new Error("Failed to build transaction!");
    }
  }

  protected async simulateTransaction(
    tx: SorobanTransaction
  ): Promise<SorobanRpcNamespace.SimulateTransactionResponse> {
    try {
      const response = await this.rpcHandler.simulateTransaction(tx);
      return response;
    } catch (error) {
      console.log("ERROR:", error);
      throw new Error("Failed to simulate transaction!");
    }
  }
  protected async prepareTransaction(
    tx: SorobanTransaction
  ): Promise<SorobanTransaction> {
    try {
      const response = await this.rpcHandler.prepareTransaction(tx);
      return response;
    } catch (error) {
      throw new Error("Failed to prepare transaction!");
    }
  }

  protected async submitSorobanTransaction(
    tx: SorobanTransaction | SorobanFeeBumpTransaction
  ): Promise<SorobanRpcNamespace.SendTransactionResponse> {
    try {
      const response = await this.rpcHandler.submitTransaction(tx);
      return response;
    } catch (error) {
      throw new Error("Failed to submit transaction!");
    }
  }

  protected async processSorobanTransaction(
    envelope: SorobanTransaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<SorobanRpcNamespace.GetSuccessfulTransactionResponse> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers);

    const finalEnvelope = feeBump
      ? ((await this.wrapSorobanFeeBump(
          signedInnerTransaction,
          feeBump
        )) as SorobanFeeBumpTransaction)
      : (TransactionBuilder.fromXDR(
          signedInnerTransaction,
          this.network.networkPassphrase
        ) as SorobanTransaction);

    const rpcResponse = await this.submitSorobanTransaction(finalEnvelope);
    const processedTransaction = this.postProcessSorobanSubmission(rpcResponse);
    return processedTransaction;
  }

  //
  // Soroban submissions might take a while to be processed.
  // This method waits for the transaction until we get
  // a final response from Soroban or until timeout is reached.
  //
  protected postProcessSorobanSubmission(
    response: SorobanRpcNamespace.SendTransactionResponse
  ): any {
    if (response.status === "ERROR") {
      console.log(
        "Soroban transaction submission failed!: ",
        response.errorResult
      );
      throw new Error("Soroban transaction submission failed!");
    }

    if (
      response.status === "PENDING" ||
      response.status === "TRY_AGAIN_LATER"
    ) {
      console.log("Waiting for Transaction!: ");
      return this.waitForSorobanTransaction(response.hash, 15); // Arbitrary 15 seconds timeout
    }

    return response;
  }

  //
  // Exoponential backoff to wait for Soroban transaction to be processed
  // starts at 1 second and doubles each time until timeout is reached.
  //
  protected async waitForSorobanTransaction(
    transactionHash: string,
    secondsToWait: number
  ): Promise<any> {
    const timeout = secondsToWait * 1000;
    const waitUntil = Date.now() + timeout;
    const initialWaitTime = 1000;
    let waitTime = initialWaitTime;

    let updatedTransaction = await this.rpcHandler.getTransaction(
      transactionHash
    );
    while (
      Date.now() < waitUntil &&
      updatedTransaction.status ===
        SorobanRpcNamespace.GetTransactionStatus.NOT_FOUND
    ) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      updatedTransaction = await this.rpcHandler.getTransaction(
        transactionHash
      );
      waitTime *= 2; // Exponential backoff
    }

    if (
      updatedTransaction.status ===
      SorobanRpcNamespace.GetTransactionStatus.SUCCESS
    ) {
      return updatedTransaction as SorobanRpcNamespace.GetSuccessfulTransactionResponse;
    }

    throw new Error("Transaction execution not found!");
  }

  protected postProcessSorobanTransaction(
    response: SorobanRpcNamespace.GetSuccessfulTransactionResponse
  ): any {
    //TODO: implement

    return response;
  }

  protected async wrapSorobanFeeBump(
    envelopeXdr: TransactionXdr,
    feeBump: FeeBumpHeader
  ): Promise<FeeBumpTransaction> {
    const tx = TransactionBuilder.fromXDR(
      envelopeXdr,
      this.network.networkPassphrase
    ) as SorobanTransaction;

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeBump.header.source,
      feeBump.header.fee,
      tx,
      this.network.networkPassphrase
    );

    const signedFeeBumpXDR = await this.signEnvelope(
      feeBumpTx,
      feeBump.signers
    );

    return TransactionBuilder.fromXDR(
      signedFeeBumpXDR,
      this.network.networkPassphrase
    ) as FeeBumpTransaction;
  }
}
