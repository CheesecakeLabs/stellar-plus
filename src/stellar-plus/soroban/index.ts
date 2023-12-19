import { SorobanRpc } from '@stellar/stellar-sdk'

import { SorobanHandler } from 'stellar-plus/soroban/types'
import { Network } from 'stellar-plus/types'
export class SorobanHandlerClient implements SorobanHandler {
  private network: Network
  public server: SorobanRpc.Server

  /**
   *
   * @param {Network} network - The network to use.
   *
   * @description - The soroban handler is used for interacting with the Soroban server.
   *
   */
  constructor(network: Network) {
    this.network = network
    this.server = new SorobanRpc.Server(this.network.rpcUrl)
  }
}
