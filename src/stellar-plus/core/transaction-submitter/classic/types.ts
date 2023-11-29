import { TransactionBuilder } from "stellar-base";
import { TransactionInvocation } from "../../types";
import { Horizon as HorizonNamespace } from "stellar-sdk";
import { Transaction } from "../../../types";

export type TransactionSubmitter = {
  createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder;
    updatedTxInvocation: TransactionInvocation;
  }>;
  submit(
    envelope: Transaction
  ): Promise<HorizonNamespace.SubmitTransactionResponse>;
  postProcessTransaction(
    response: HorizonNamespace.SubmitTransactionResponse
  ): any;
};
