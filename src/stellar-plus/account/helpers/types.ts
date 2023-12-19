import { AccountDataViewer, AccountDataViewerConstructor } from 'stellar-plus/account/helpers/account-data-viewer/types'
import { Friendbot } from 'stellar-plus/account/helpers/friendbot/types'

export type AccountHelpersPayload = AccountDataViewerConstructor
export type AccountHelpers = {
  accountDataViewer?: AccountDataViewer
  friendbot?: Friendbot
}
