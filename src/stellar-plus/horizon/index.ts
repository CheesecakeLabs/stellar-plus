import { Horizon } from '@stellar/stellar-sdk'

import { DHHError } from 'stellar-plus/horizon/errors'
import { HorizonHandler } from 'stellar-plus/horizon/types'
import { NetworkConfig } from 'stellar-plus/types'

export class HorizonHandlerClient implements HorizonHandler {
  public networkConfig: NetworkConfig
  public server: Horizon.Server

  /**
   *
   * @param {NetworkConfig} networkConfig - The network to use.
   *
   * @description - The horizon handler is used for interacting with the Horizon server.
   *
   */
  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig

    if (!this.networkConfig.horizonUrl) {
      throw DHHError.missingHorizonUrl()
    }

    const serverOpts = { allowHttp: networkConfig.allowHttp }

    this.server = new Horizon.Server(this.networkConfig.horizonUrl, serverOpts)
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
      throw DHHError.failedToLoadAccount()
    }
  }
}
