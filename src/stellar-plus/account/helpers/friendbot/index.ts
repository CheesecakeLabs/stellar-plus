import axios from "axios";
import { AccountHelpers } from "..";
import { Network } from "../../../types";
import { Friendbot } from "./types";

export class FriendbotClient implements Friendbot {
  private network: Network;
  private parent: AccountHelpers;
  constructor(network: Network, parent: AccountHelpers) {
    this.network = network;
    this.parent = parent;
  }

  public async initialize(): Promise<void> {
    if (
      "publicKey" in this.parent &&
      this.parent.publicKey &&
      this.parent.publicKey !== ""
    ) {
      try {
        const response = await axios.get(
          `${this.network.friendbotUrl}?addr=${encodeURIComponent(
            this.parent.publicKey as string
          )}`
        );

        return;
      } catch (error) {
        console.log("error", error);
        throw new Error("Failed to create account with friendbot!");
      }
    }

    throw new Error("Account has no valid public key!");
  }

  public async getTransactions(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
