import { TransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/types'
import { Network } from 'stellar-plus/types'

export type TransactionProcessorConstructor = {
  network: Network
  transactionSubmitter?: TransactionSubmitter
}
