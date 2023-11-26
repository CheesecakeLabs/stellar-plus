import { SorobanRpcServer, Network } from "../types";
import { SorobanHandler } from "./types";
import { Server } from "soroban-client";
export class SorobanHandlerClient implements SorobanHandler {
  private network: Network;
  public server: SorobanRpcServer;

  constructor(network: Network) {
    this.network = network;
    this.server = new Server(this.network.horizonUrl);
  }
}
