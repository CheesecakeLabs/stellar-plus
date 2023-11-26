import { AccountHelpers } from "..";
import { HorizonHandlerClient } from "../../../horizon";
import { HorizonHandler } from "../../../horizon/types";
import { Network } from "../../../types";
import { AccountDataViewer } from "./types";
import { Horizon } from "stellar-sdk";

export class AccountDataViewerClient implements AccountDataViewer {
  private network: Network;
  private horizonHandler: HorizonHandler;
  private parent: AccountHelpers;
  constructor(network: Network, parent: AccountHelpers) {
    this.network = network;
    this.horizonHandler = new HorizonHandlerClient(this.network);
    this.parent = parent;
  }

  public async getBalances(): Promise<
    (
      | Horizon.BalanceLineNative
      | Horizon.BalanceLineAsset<"credit_alphanum4">
      | Horizon.BalanceLineAsset<"credit_alphanum12">
      | Horizon.BalanceLineLiquidityPool
    )[]
  > {
    if (
      "publicKey" in this.parent &&
      this.parent.publicKey &&
      this.parent.publicKey !== ""
    ) {
      const account = await this.horizonHandler.loadAccount(
        this.parent.publicKey as string
      );
      return account.balances;
    }

    throw new Error("Account has no valid public key!");
  }

  public async getTransactions(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
