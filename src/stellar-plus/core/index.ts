import { TransactionProcessor } from '@core/classic-transaction-processor'
import { SorobanTransactionProcessor } from '@core/soroban-transaction-processor'
import { ChannelAccountsTransactionSubmitter } from '@core/transaction-submitter/classic/channel-accounts-submitter'
import { DefaultTransactionSubmitter } from '@core/transaction-submitter/classic/default'

export const Core = {
  Classic: {
    DefaultTransactionSubmitter,
    ChannelAccountsTransactionSubmitter,
    TransactionProcessor,
  },
  Soroban: {
    SorobanTransactionProcessor,
  },
}
