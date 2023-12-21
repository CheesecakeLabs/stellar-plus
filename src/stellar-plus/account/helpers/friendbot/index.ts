import axios from 'axios'

import { AccountHelpers } from 'stellar-plus/account/helpers'
import { Friendbot } from 'stellar-plus/account/helpers/friendbot/types'
import { Network } from 'stellar-plus/types'

import { FBError } from './errors'

export class FriendbotClient implements Friendbot {
  private network: Network
  private parent: AccountHelpers
  constructor(network: Network, parent: AccountHelpers) {
    this.network = network
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
        await axios.get(`${this.network.friendbotUrl}?addr=${encodeURIComponent(this.parent.publicKey as string)}`)

        return
      } catch (error) {
        throw FBError.failedToCreateAccountWithFriendbotError(error as Error)
      }
    }
    throw FBError.accountHasNoValidPublicKeyError()
  }

  /**
   *
   * @description - Throws an error if the network is not a test network.
   */
  private requireTestNetwork(): void {
    if (!this.network.friendbotUrl) {
      throw FBError.friendbotNotAvailableError()
    }
  }
}
