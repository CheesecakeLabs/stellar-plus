import { DefaultAccountHandler } from "../account";
import { AccountHandler } from "../account/account-handler/types";
import { TransactionProcessor } from "../core/classic-transaction-processor";
import { TransactionSubmitter } from "../core/transaction-submitter/classic/types";
import { EnvelopeHeader, FeeBumpHeader } from "../core/types";
import { Network, Transaction, TransactionXdr } from "../types";
import { Operation, TransactionBuilder } from "stellar-sdk";

export class Opex extends TransactionProcessor implements AccountHandler {
  private account: AccountHandler;
  private defaultHeader: EnvelopeHeader;
  private defaultFeeBump?: FeeBumpHeader;
  publicKey: string;
  constructor(
    network: Network,
    account: AccountHandler,
    transactionSubmitter?: TransactionSubmitter
  ) {
    super(network, transactionSubmitter);
    this.account = account;

    this.publicKey = account.getPublicKey();
    this.defaultHeader = {
      source: account.getPublicKey(),
      fee: "100",
      timeout: 30,
    };
  }

  public async initializeNewChannels(
    number: number
  ): Promise<DefaultAccountHandler[]> {
    if (number <= 0 || number > 15) {
      throw new Error("Invalid number of channels! Must be between 1 and 15!");
    }

    const channels: DefaultAccountHandler[] = [];
    const sponsor = this.account;

    const sourceAccount = await this.horizonHandler.loadAccount(
      await sponsor.getPublicKey()
    );

    const envelope = new TransactionBuilder(sourceAccount, {
      fee: this.defaultHeader.fee,
      networkPassphrase: this.network.networkPassphrase,
    });

    const signers = [sponsor];

    for (let i = 0; i < number; i++) {
      const channel = new DefaultAccountHandler({ network: this.network });
      channels.push(channel);

      envelope
        .addOperation(
          Operation.beginSponsoringFutureReserves({
            sponsoredId: channel.publicKey,
          })
        )
        .addOperation(
          Operation.createAccount({
            source: sponsor.publicKey,
            destination: channel.publicKey,
            startingBalance: "0",
          })
        )
        .addOperation(
          Operation.endSponsoringFutureReserves({
            source: channel.publicKey,
          })
        );

      signers.push(channel);
      channels.push(channel);
    }

    const tx = envelope.setTimeout(this.defaultHeader.timeout).build();

    const response = await this.processTransaction(tx, signers);

    return channels;
  }

  public sign(tx: Transaction): Promise<TransactionXdr> | TransactionXdr {
    return this.account.sign(tx);
  }

  public getPublicKey(): string {
    return this.account.getPublicKey();
  }
}
