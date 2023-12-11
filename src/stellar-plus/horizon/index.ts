import { Horizon } from '@stellar/stellar-sdk'

import { HorizonHandler } from '@horizon/types'
import { Network } from '@stellar-plus/types'

export class HorizonHandlerClient implements HorizonHandler {
  private network: Network
  public server: Horizon.Server

  /**
   *
   * @param {Network} network - The network to use.
   *
   * @description - The horizon handler is used for interacting with the Horizon server.
   *
   */
  constructor(network: Network) {
    this.network = network
    this.server = new Horizon.Server(this.network.horizonUrl)
  }

  /**
   *
   * @param {string} accountId - The account ID to load.
   *
   * @description - Loads the account from the Horizon server.
   *
   * @returns {AccountResponse} The account response from the Horizon server.
   */
  public async loadAccount(accountId: string): Promise<Horizon.AccountResponse> {
    try {
      return await this.server.loadAccount(accountId)
    } catch (error) {
      // console.log(error)
      throw new Error('Could not load account from horizon')
    }
  }
}
