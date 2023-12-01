import { TransactionBuilder } from "stellar-base";
import { HorizonHandler } from "../../../..";
import { Network, SorobanTransaction, Transaction } from "../../../../types";
import {
  EnvelopeHeader,
  FeeBumpHeader,
  TransactionInvocation,
} from "../../../types";
import {
  Horizon as HorizonNamespace,
  xdr as xdrNamespace,
  Transaction as ClassicTransaction,
  TransactionBuilder as ClassicTxBuild,
} from "stellar-sdk";
import { TransactionSubmitter as TransactionSubmitter } from "../types";

export class DefaultTransactionSubmitter implements TransactionSubmitter {
  private feeBump?: FeeBumpHeader;
  private network: Network;
  private horizonHandler: HorizonHandler;

  constructor(network: Network, feeBump?: FeeBumpHeader) {
    this.network = network;
    this.horizonHandler = new HorizonHandler(network);
    this.feeBump = feeBump;
  }

  public async createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder;
    updatedTxInvocation: TransactionInvocation;
  }> {
    const { header } = txInvocation;
    if (this.feeBump && !txInvocation.feeBump) {
      txInvocation.feeBump = this.feeBump;
    }

    const sourceAccount = await this.horizonHandler.loadAccount(header.source);

    const envelope = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    });

    return { envelope, updatedTxInvocation: txInvocation };
  }

  public async submit(
    envelope: Transaction
  ): Promise<HorizonNamespace.SubmitTransactionResponse> {
    try {
      // stellar-base vs stellar-sdk conversion
      const envelopeXdr = envelope.toXDR();
      const classicEnvelope = ClassicTxBuild.fromXDR(
        envelopeXdr,
        this.network.networkPassphrase
      ) as ClassicTransaction;

      const response = await this.horizonHandler.server.submitTransaction(
        classicEnvelope
      );
      return response as HorizonNamespace.SubmitTransactionResponse;
    } catch (error) {
      console.log("Couldn't Submit the transaction: ");
      const resultObject = (error as any)?.response?.data?.extras?.result_codes;

      console.log(resultObject);

      throw new Error("Failed to submit transaction!");
    }
  }

  public postProcessTransaction(
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

      throw new Error("Transaction failed!");
    }

    return response;
  }
}
