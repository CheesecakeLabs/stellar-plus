import { Horizon } from '@stellar/stellar-sdk'
import axios from 'axios'

import { ABError } from 'stellar-plus/account/base/errors'
import { AccountBasePayload, AccountBase as AccountBaseType } from 'stellar-plus/account/base/types'
import { NetworkConfig } from 'stellar-plus/constants'
import { HorizonHandlerClient as HorizonHandler } from 'stellar-plus/horizon/'

export class AccountBase implements AccountBaseType {
  protected publicKey: string
  protected networkConfig?: NetworkConfig
  protected horizonHandler?: HorizonHandler

  /**
   *
   * @args {} payload - The payload for the account. Additional parameters may be provided to enable different helpers.
   * @param {string} payload.publicKey The public key of the account.
   * @param {NetworkConfig=} payload.networkConfig The network config for the target network.
   *
   * @description - The base account is used for handling accounts with no management actions.
   */
  constructor(payload: AccountBasePayload) {
    const { publicKey, networkConfig, horizonHandler } = payload

    this.publicKey = publicKey
    this.networkConfig = networkConfig
    this.horizonHandler = horizonHandler as HorizonHandler

    if (this.networkConfig && !this.horizonHandler) {
      this.horizonHandler = new HorizonHandler(this.networkConfig)
    }
  }

  /**
   *
   * @returns {string} The public key of the account.
   *
   */
  getPublicKey(): string {
    return this.publicKey
  }

  /**
   *
   * @returns {void}
   * @description - Initialize the account with the friendbot and funds it with 10.000 XLM.
   */
  public async initializeWithFriendbot(): Promise<void> {
    this.requireTestNetwork()

    try {
      await axios.get(
        `${this.networkConfig!.friendbotUrl}?addr=${encodeURIComponent(this.publicKey)}` // friendbot URL in networkConfig validated in requireTestNetwork()
      )

      return
    } catch (e) {
      throw ABError.failedToCreateAccountWithFriendbotError(e as Error)
    }
  }

  /**
   *
   * @returns {Horizon.BalanceLine[]} A list of the account's balances.
   * @description - The account's balances are retrieved from the Horizon server and provided in a list, including all assets.
   */
  public async getBalances(): Promise<
    (
      | Horizon.HorizonApi.BalanceLineNative
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.HorizonApi.BalanceLineLiquidityPool
    )[]
  > {
    this.requireHorizonHandler()

    try {
      const account = await this.horizonHandler!.loadAccount(this.publicKey) // Horizon handler validated in requireHorizonHandler()
      return account.balances
    } catch (error) {
      throw ABError.failedToLoadBalances(error as Error)
    }
  }

  /**
   *
   * @description - Throws an error if the network is not a test network.
   */
  protected requireTestNetwork(): void {
    if (!this.networkConfig?.friendbotUrl) {
      throw ABError.friendbotNotAvailableError()
    }
  }

  /**
   *
   * @description - Throws an error if the horizon handler is not set
   */
  protected requireHorizonHandler(): void {
    if (!this.horizonHandler) {
      throw ABError.horizonHandlerNotAvailableError()
    }
  }
}
