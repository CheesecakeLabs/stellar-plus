import { HorizonHandler } from "../../horizon/types";
import {
  TransactionBuilder,
  Transaction as ClassicTransaction,
  Horizon as HorizonNamespace,
  xdr as xdrNamespace,
} from "stellar-sdk";
import * as SorobanClient from "soroban-client";
import {
  FeeBumpTransaction,
  Network,
  SorobanTransaction,
  Transaction,
  TransactionXdr,
} from "../../types";
import { AccountHandler } from "../../account/account-handler/types";
import { FeeBumpHeader } from "../types";
import { HorizonHandlerClient } from "../../horizon";

export class TransactionProcessor {
  protected horizonHandler: HorizonHandler;
  protected network: Network;
  constructor(network: Network) {
    this.network = network;
    this.horizonHandler = new HorizonHandlerClient(network);
  }

  protected async signEnvelope(
    envelope: Transaction,
    signers: AccountHandler[]
  ): Promise<TransactionXdr> {
    let signedXDR = envelope.toXDR();
    for (const signer of signers) {
      signedXDR = await signer.sign(
        SorobanClient.TransactionBuilder.fromXDR(
          signedXDR,
          this.network.networkPassphrase
        )
      );
    }
    return signedXDR;
  }

  protected async wrapFeeBump(
    envelopeXdr: TransactionXdr,
    feeBump: FeeBumpHeader
  ): Promise<FeeBumpTransaction> {
    const tx = TransactionBuilder.fromXDR(
      envelopeXdr,
      this.network.networkPassphrase
    ) as ClassicTransaction;

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

  protected async processTransaction(
    envelope: Transaction,
    signers: AccountHandler[],
    feeBump?: FeeBumpHeader
  ): Promise<any> {
    const signedInnerTransaction = await this.signEnvelope(envelope, signers);
    const finalEnvelope = feeBump
      ? await this.wrapFeeBump(signedInnerTransaction, feeBump)
      : TransactionBuilder.fromXDR(
          signedInnerTransaction,
          this.network.networkPassphrase
        );
    const horizonResponse = (await this.submitTransaction(
      finalEnvelope
    )) as HorizonNamespace.SubmitTransactionResponse;
    const processedTransaction = this.postProcessTransaction(horizonResponse);
    return processedTransaction;
  }

  protected async submitTransaction(
    envelope: Transaction
  ): Promise<HorizonNamespace.SubmitTransactionResponse> {
    try {
      const response = await this.horizonHandler.server.submitTransaction(
        envelope as ClassicTransaction
      );
      return response as HorizonNamespace.SubmitTransactionResponse;
    } catch (error) {
      console.log("Couldn't Submit the transaction: ");

      throw new Error("Failed to submit transaction!");
    }
  }

  protected postProcessTransaction(
    response: HorizonNamespace.SubmitTransactionResponse
  ): any {
    if (!response.successful) {
      const restulObject = xdrNamespace.TransactionResult.fromXDR(
        response.result_xdr,
        "base64"
      );
      const resultMetaObject = xdrNamespace.TransactionResultMeta.fromXDR(
        response.result_meta_xdr,
        "base64"
      );

      console.log("Transaction failed! ");
      console.log(
        "Result: ==========================================================",
        restulObject
      );
      console.log(
        "Result Meta: ==========================================================",
        resultMetaObject
      );
      throw new Error("Transaction failed!");
    }

    return response;
  }
}
