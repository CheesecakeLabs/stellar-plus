import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { FreighterAccountHandlerClient as FreighterAccountHandler } from 'stellar-plus/account/account-handler/freighter'
import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { AccountBaseClient as Base } from 'stellar-plus/account/base'
import { AccountBase } from 'stellar-plus/account/base/types'

//
// Export Classes
//

export { Base, FreighterAccountHandler, DefaultAccountHandler }

export type BaseAccountType = AccountBase
export type AccountHandlerType = AccountHandler
export type FreighterAccountHandlerType = typeof FreighterAccountHandler
export type DefaultAccountHandlerType = typeof DefaultAccountHandler

//
// export types
//
