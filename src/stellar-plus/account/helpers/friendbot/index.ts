import axios from 'axios'

import { AccountHelpers } from '@account/helpers'
import { Friendbot } from '@account/helpers/friendbot/types'
import { Network, NetworksList } from '@stellar-plus/types'

export class FriendbotClient implements Friendbot {
  private network: Network
  private parent: AccountHelpers
  constructor(network: Network, parent: AccountHelpers) {
    this.network = network
    this.parent = parent
  }

  /**
   *
   * @returns void
   * @description - Initialize the account with the friendbot and funds it with 10.000 XLM.
   */
  public async initialize(): Promise<void> {
    this.requireTestNetwork()

    if ('publicKey' in this.parent && this.parent.publicKey && this.parent.publicKey !== '') {
      try {
        await axios.get(`${this.network.friendbotUrl}?addr=${encodeURIComponent(this.parent.publicKey as string)}`)

        return
      } catch (error) {
        throw new Error('Failed to create account with friendbot!')
      }
    }

    throw new Error('Account has no valid public key!')
  }

  private requireTestNetwork(): void {
    if (this.network.name === NetworksList.mainnet) {
      throw new Error('Friendbot is not available in mainnet!')
    }
  }
}
