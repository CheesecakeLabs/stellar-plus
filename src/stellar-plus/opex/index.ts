import { DefaultAccountHandler } from "../account";
import { AccountHandler } from "../account/account-handler/types";
import { TransactionProcessor } from "../core/classic-transaction-processor";
import { TransactionSubmitter } from "../core/transaction-submitter/classic/types";
import {
  EnvelopeHeader,
  FeeBumpHeader,
  TransactionInvocation,
} from "../core/types";
import { Network, Transaction, TransactionXdr } from "../types";
import {
  Operation,
  TransactionBuilder,
  xdr as ClassicXdrNamespace,
} from "stellar-sdk";

export class Opex extends TransactionProcessor implements AccountHandler {
  private account: AccountHandler;
  private defaultHeader: EnvelopeHeader;
  private defaultFeeBump?: FeeBumpHeader;
  private defaultTxInvocation: TransactionInvocation;
  publicKey: string;
  constructor(
    network: Network,
    account: AccountHandler,
    transactionSubmitter?: TransactionSubmitter,
    defaulHeader?: EnvelopeHeader
  ) {
    super(network, transactionSubmitter);
    this.account = account;

    this.publicKey = account.getPublicKey();
    this.defaultHeader = defaulHeader || {
      source: account.getPublicKey(),
      fee: "100",
      timeout: 30,
    };

    this.defaultTxInvocation = {
      header: this.defaultHeader,
      signers: [this.account],
    };
  }

  public async initializeNewChannels(
    number: number
  ): Promise<DefaultAccountHandler[]> {
    if (number <= 0 || number > 15) {
      throw new Error("Invalid number of channels! Must be between 1 and 15!");
    }
    const channels: DefaultAccountHandler[] = [];
    const operations: ClassicXdrNamespace.Operation[] = [];

    for (let i = 0; i < number; i++) {
      const channel = new DefaultAccountHandler({ network: this.network });
      channels.push(channel);

      operations.push(
        Operation.beginSponsoringFutureReserves({
          sponsoredId: channel.publicKey,
        })
      );
      operations.push(
        Operation.createAccount({
          source: this.getPublicKey(),
          destination: channel.publicKey,
          startingBalance: "0",
        })
      );
      operations.push(
        Operation.endSponsoringFutureReserves({
          source: channel.publicKey,
        })
      );
    }

    const txInvocation = { ...this.defaultTxInvocation };
    txInvocation.signers = [...txInvocation.signers, ...channels];

    const { builtTx, updatedTxInvocation } = await this.buildCustomTransaction(
      operations,
      txInvocation
    );
    const updatedSigners = updatedTxInvocation.signers;

    const response = await this.processTransaction(builtTx, updatedSigners);

    return channels;
  }

  public sign(tx: Transaction): Promise<TransactionXdr> | TransactionXdr {
    return this.account.sign(tx);
  }

  public getPublicKey(): string {
    return this.account.getPublicKey();
  }
}
