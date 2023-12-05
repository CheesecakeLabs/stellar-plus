import { AccountResponse, Server } from 'stellar-sdk'

import { HorizonHandler } from '@horizon/types'
import { HorizonServer, Network } from '@stellar-plus/types'

export class HorizonHandlerClient implements HorizonHandler {
  private network: Network
  public server: HorizonServer

  constructor(network: Network) {
    this.network = network
    this.server = new Server(this.network.horizonUrl)
  }

  public async loadAccount(accountId: string): Promise<AccountResponse> {
    try {
      return await this.server.loadAccount(accountId)
    } catch (error) {
      // console.log(error)
      throw new Error('Could not load account from horizon')
    }
  }
}
