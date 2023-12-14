import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import { SorobanTransactionProcessor } from 'stellar-plus/core/soroban-transaction-processor'
import { ChannelAccountsTransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/channel-accounts-submitter'
import { DefaultTransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/default'

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
