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
import { FeeBumpHeader, TransactionInvocation } from "../types";
import { HorizonHandlerClient } from "../../horizon";
import { TransactionSubmitter } from "../transaction-submitter/classic/types";
import { DefaultTransactionSubmitter } from "../transaction-submitter/classic/default";

export class TransactionProcessor {
  protected horizonHandler: HorizonHandler;
  protected network: Network;
  protected transactionSubmitter: TransactionSubmitter;

  constructor(network: Network, transactionSubmitter?: TransactionSubmitter) {
    this.network = network;
    this.horizonHandler = new HorizonHandlerClient(network);
    this.transactionSubmitter =
      transactionSubmitter || new DefaultTransactionSubmitter(network);
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

  public async processTransaction(
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
    const horizonResponse = (await this.transactionSubmitter.submit(
      finalEnvelope
    )) as HorizonNamespace.SubmitTransactionResponse;
    const processedTransaction =
      this.transactionSubmitter.postProcessTransaction(horizonResponse);
    return processedTransaction;
  }

  protected verifySigners(
    publicKeys: string[],
    signers: AccountHandler[]
  ): void {
    publicKeys.forEach((publicKey) => {
      if (!signers.find((signer) => signer.publicKey === publicKey)) {
        throw new Error(`Missing signer for public key: ${publicKey}`);
      }
    });
  }

  public async buildCustomTransaction(
    operations: xdrNamespace.Operation[],
    txInvocation: TransactionInvocation
  ): Promise<{
    builtTx: ClassicTransaction;
    updatedTxInvocation: TransactionInvocation;
  }> {
    const { envelope, updatedTxInvocation } =
      await this.transactionSubmitter.createEnvelope(txInvocation);

    const { header } = updatedTxInvocation;

    let tx: TransactionBuilder = envelope;

    for (const operation of operations) {
      tx = envelope.addOperation(operation);
    }

    const builtTx = tx.setTimeout(header.timeout).build();

    return { builtTx, updatedTxInvocation };
  }
}
