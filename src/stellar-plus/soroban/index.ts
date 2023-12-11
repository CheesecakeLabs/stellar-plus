import { Server } from 'soroban-client'

import { SorobanHandler } from '@soroban/types'
import { Network, SorobanRpcServer } from '@stellar-plus/types'
export class SorobanHandlerClient implements SorobanHandler {
  private network: Network
  public server: SorobanRpcServer

  constructor(network: Network) {
    this.network = network
    this.server = new Server(this.network.horizonUrl)
  }
}
