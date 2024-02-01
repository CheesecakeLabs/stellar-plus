import { AccountHandler } from 'stellar-plus/account'
import { FeeBumpHeader } from 'stellar-plus/core/types'
import { TransactionInvocation } from 'stellar-plus/types'

export type InputType = {
  txInvocation: TransactionInvocation
}

export type ChannelAccountsPluginConstructorArgs = {
  channels?: AccountHandler[]
  feeBump?: FeeBumpHeader
}
