import { Horizon } from '@stellar/stellar-sdk'

import { AccountHelpers } from 'stellar-plus/account/helpers'
import { AccountDataViewer } from 'stellar-plus/account/helpers/account-data-viewer/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon/index'
import { HorizonHandler } from 'stellar-plus/horizon/types'
import { NetworkConfig } from 'stellar-plus/types'

export class AccountDataViewerClient implements AccountDataViewer {
  private networkConfig: NetworkConfig
  private horizonHandler: HorizonHandler
  private parent: AccountHelpers
  constructor(networkConfig: NetworkConfig, parent: AccountHelpers) {
    this.networkConfig = networkConfig
    this.horizonHandler = new HorizonHandlerClient(this.networkConfig) as HorizonHandler
    this.parent = parent
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
    if ('publicKey' in this.parent && this.parent.publicKey && this.parent.publicKey !== '') {
      const account = await this.horizonHandler.loadAccount(this.parent.publicKey as string)
      return account.balances
    }

    throw new Error('Account has no valid public key!')
  }
}
