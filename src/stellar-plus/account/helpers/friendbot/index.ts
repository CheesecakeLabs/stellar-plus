import axios from 'axios'

import { AccountHelpers } from 'stellar-plus/account/helpers'
import { Friendbot } from 'stellar-plus/account/helpers/friendbot/types'
import { NetworkConfig } from 'stellar-plus/types'

import { FBError } from './errors'

export class FriendbotClient implements Friendbot {
  private networkConfig: NetworkConfig
  private parent: AccountHelpers
  constructor(networkConfig: NetworkConfig, parent: AccountHelpers) {
    this.networkConfig = networkConfig
    this.parent = parent
  }

  /**
   *
   * @returns {void}
   * @description - Initialize the account with the friendbot and funds it with 10.000 XLM.
   */
  public async initialize(): Promise<void> {
    this.requireTestNetwork()

    if ('publicKey' in this.parent && this.parent.publicKey && this.parent.publicKey !== '') {
      try {
        await axios.get(
          `${this.networkConfig.friendbotUrl}?addr=${encodeURIComponent(this.parent.publicKey as string)}`
        )

        return
      } catch (e) {
        throw FBError.failedToCreateAccountWithFriendbotError(e as Error)
      }
    }
    throw FBError.accountHasNoValidPublicKeyError()
  }

  /**
   *
   * @description - Throws an error if the network is not a test network.
   */
  private requireTestNetwork(): void {
    if (!this.networkConfig.friendbotUrl) {
      throw FBError.friendbotNotAvailableError()
    }
  }
}
