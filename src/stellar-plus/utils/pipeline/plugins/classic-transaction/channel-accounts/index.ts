import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineType,
} from 'stellar-plus/core/pipelines/classic-transaction/types'

import { BaseChannelAccountsPlugin } from '../../soroban-transaction/channel-accounts'
import { ChannelAccountsPluginConstructorArgs } from '../../soroban-transaction/channel-accounts/types'

export class ClassicChannelAccountsPlugin extends BaseChannelAccountsPlugin<
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineType
> {
  constructor(args: ChannelAccountsPluginConstructorArgs) {
    super(ClassicTransactionPipelineType.id, args.channels)
  }
}
