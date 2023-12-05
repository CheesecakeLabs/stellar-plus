import { AccountDataViewerClient } from '@account/helpers/account-data-viewer'
import { AccountDataViewer } from '@account/helpers/account-data-viewer/types'
import { FriendbotClient } from '@account/helpers/friendbot'
import { Friendbot } from '@account/helpers/friendbot/types'
import { AccountHelpersPayload, AccountHelpers as AccountHelpersType } from '@account/helpers/types'

export class AccountHelpers implements AccountHelpersType {
  public accountDataViewer?: AccountDataViewer
  public friendbot?: Friendbot

  constructor(payload: AccountHelpersPayload) {
    if ('network' in payload && payload.network) {
      this.accountDataViewer = new AccountDataViewerClient(payload.network, this)
      this.friendbot = new FriendbotClient(payload.network, this)
    }
  }
}
