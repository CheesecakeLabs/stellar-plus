import { Server, AccountResponse } from "stellar-sdk";
import { HorizonServer, Network } from "../types";
import { HorizonHandler } from "./types";
export class HorizonHandlerClient implements HorizonHandler {
  private network: Network;
  public server: HorizonServer;

  constructor(network: Network) {
    this.network = network;
    this.server = new Server(this.network.horizonUrl);
  }

  public async loadAccount(accountId: string): Promise<AccountResponse> {
    try {
      return await this.server.loadAccount(accountId);
    } catch (error) {
      console.log(error);
      throw new Error("Could not load account from horizon");
    }
  }
}
