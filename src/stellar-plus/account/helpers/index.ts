import { AccountDataViewerClient } from 'stellar-plus/account/helpers/account-data-viewer'
import { AccountDataViewer } from 'stellar-plus/account/helpers/account-data-viewer/types'
import { FriendbotClient } from 'stellar-plus/account/helpers/friendbot'
import { Friendbot } from 'stellar-plus/account/helpers/friendbot/types'
import { AccountHelpersPayload, AccountHelpers as AccountHelpersType } from 'stellar-plus/account/helpers/types'

export class AccountHelpers implements AccountHelpersType {
  public accountDataViewer?: AccountDataViewer
  public friendbot?: Friendbot

  constructor(payload: AccountHelpersPayload) {
    if ('networkConfig' in payload && payload.networkConfig) {
      this.accountDataViewer = new AccountDataViewerClient(payload.networkConfig, this)
      this.friendbot = new FriendbotClient(payload.networkConfig, this)
    }
  }
}
