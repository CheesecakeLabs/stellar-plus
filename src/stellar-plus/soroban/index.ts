import { SorobanRpc } from '@stellar/stellar-sdk'

import { SorobanHandler } from '@soroban/types'
import { Network, SorobanRpcServer } from '@stellar-plus/types'
export class SorobanHandlerClient implements SorobanHandler {
  private network: Network
  public server: SorobanRpcServer

  /**
   *
   * @param {Network} network - The network to use.
   *
   * @description - The soroban handler is used for interacting with the Soroban server.
   *
   */
  constructor(network: Network) {
    this.network = network
    this.server = new SorobanRpc.Server(this.network.horizonUrl)
  }
}
