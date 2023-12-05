import { AccountDataViewer, AccountDataViewerConstructor } from '@account/helpers/account-data-viewer/types'
import { Friendbot } from '@account/helpers/friendbot/types'

export type AccountHelpersPayload = AccountDataViewerConstructor
export type AccountHelpers = {
  accountDataViewer?: AccountDataViewer
  friendbot?: Friendbot
}
