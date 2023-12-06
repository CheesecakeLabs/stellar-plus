import { Horizon } from 'stellar-sdk'

import { AccountHelpers } from '@account/helpers'
import { AccountDataViewer } from '@account/helpers/account-data-viewer/types'
import { HorizonHandlerClient } from '@horizon/index'
import { HorizonHandler } from '@horizon/types'
import { Network } from '@stellar-plus/types'

export class AccountDataViewerClient implements AccountDataViewer {
  private network: Network
  private horizonHandler: HorizonHandler
  private parent: AccountHelpers
  constructor(network: Network, parent: AccountHelpers) {
    this.network = network
    this.horizonHandler = new HorizonHandlerClient(this.network) as HorizonHandler
    this.parent = parent
  }

  /**
   *
   * @returns The account's balances.
   * @description - The account's balances are retrieved from the Horizon server and provided in a list, including all assets.
   */
  public async getBalances(): Promise<
    (
      | Horizon.BalanceLineNative
      | Horizon.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.BalanceLineLiquidityPool
    )[]
  > {
    if ('publicKey' in this.parent && this.parent.publicKey && this.parent.publicKey !== '') {
      const account = await this.horizonHandler.loadAccount(this.parent.publicKey as string)
      return account.balances
    }

    throw new Error('Account has no valid public key!')
  }

  /**
   *
   */
  public async getTransactions(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
