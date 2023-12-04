import { DefaultAccountHandler } from "../account";
import { AccountHandler } from "../account/account-handler/types";
import { TransactionProcessor } from "../core/classic-transaction-processor";

import { Operation, xdr as ClassicXdrNamespace } from "stellar-base";
import { Network } from "../types";
import { TransactionInvocation } from "../core/types";

export class ChannelAccounts {
  public static async initializeNewChannels(args: {
    numberOfChannels: number;
    sponsor: AccountHandler;
    network: Network;
    txInvocation: TransactionInvocation;
  }): Promise<DefaultAccountHandler[]> {
    const { numberOfChannels, sponsor, network, txInvocation } = args;

    const txProcessor = new TransactionProcessor(network);

    if (numberOfChannels <= 0 || numberOfChannels > 15) {
      throw new Error("Invalid number of channels! Must be between 1 and 15!");
    }
    const channels: DefaultAccountHandler[] = [];
    const operations: ClassicXdrNamespace.Operation[] = [];

    for (let i = 0; i < numberOfChannels; i++) {
      const channel = new DefaultAccountHandler({ network });
      channels.push(channel);

      operations.push(
        Operation.beginSponsoringFutureReserves({
          sponsoredId: channel.publicKey,
        }),
        Operation.createAccount({
          source: sponsor.getPublicKey(),
          destination: channel.publicKey,
          startingBalance: "0",
        }),
        Operation.endSponsoringFutureReserves({
          source: channel.publicKey,
        })
      );
    }

    const verifiedTxInvocation = this.verifyTxInvocationWithSponsor(
      txInvocation,
      sponsor
    );

    verifiedTxInvocation.signers = [
      ...verifiedTxInvocation.signers,
      ...channels,
    ];

    const { builtTx, updatedTxInvocation } =
      await txProcessor.buildCustomTransaction(
        operations,
        verifiedTxInvocation
      );

    await txProcessor.processTransaction(builtTx, updatedTxInvocation.signers);

    return channels;
  }

  private static verifyTxInvocationWithSponsor(
    txInvocation: TransactionInvocation,
    sponsor: AccountHandler
  ): TransactionInvocation {
    return {
      ...txInvocation,
      signers:
        txInvocation.header.source === sponsor.getPublicKey()
          ? txInvocation.signers
          : [...txInvocation.signers, sponsor],
    };
  }
}
