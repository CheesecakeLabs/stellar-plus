import { SorobanRpc } from '@stellar/stellar-sdk'

import { SorobanHandler } from 'stellar-plus/soroban/types'
import { NetworkConfig } from 'stellar-plus/types'
export class SorobanHandlerClient implements SorobanHandler {
  private networkConfig: NetworkConfig
  public server: SorobanRpc.Server

  /**
   *
   * @param {NetworkConfig} networkConfig - The network to use.
   *
   * @description - The soroban handler is used for interacting with the Soroban server.
   *
   */
  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig
    this.server = new SorobanRpc.Server(this.networkConfig.rpcUrl)
  }
}
