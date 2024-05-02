import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { FreighterAccountHandlerClient as FreighterAccountHandler } from 'stellar-plus/account/account-handler/freighter'
import { AccountHandler as _AccountHandler } from 'stellar-plus/account/account-handler/types'
import { AccountBase as Base } from 'stellar-plus/account/base'
import { AccountBase } from 'stellar-plus/account/base/types'

export { Base, FreighterAccountHandler, DefaultAccountHandler }

export type BaseAccount = AccountBase
export type AccountHandler = _AccountHandler
