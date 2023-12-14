import { ChannelAccounts as ChannelAccountsHandler } from 'stellar-plus/channel-accounts/index'
import { CertificateOfDepositClient } from 'stellar-plus/soroban/contracts/certificate-of-deposit'

export * as Account from 'stellar-plus/account/index'
export * as Asset from 'stellar-plus/asset/index'
export * as Constants from './constants'
export { HorizonHandlerClient as HorizonHandler } from 'stellar-plus/horizon/index'
export { SorobanHandlerClient as SorobanHandler } from 'stellar-plus/soroban/index'

export { ContractEngine } from 'stellar-plus/core/contract-engine'

export { Core } from 'stellar-plus/core/index'

export const Contracts = {
  CertificateOfDeposit: CertificateOfDepositClient,
}

export const Utils = {
  ChannelAccountsHandler,
}

export * as RPC from 'stellar-plus/rpc/index'

// export { TransactionInvocation } from 'stellar-plus/core/types'

// import { DefaultTransactionSubmitter } from "./core/transaction-submitter/classic/default";
// import { ChannelAccountsTransactionSubmitter } from "./core/transaction-submitter/classic/channel-accounts-submitter";
// import { ChannelAccounts as ChannelAccountsHandler } from "./channel-accounts";

// export const Core = {
//   Classic: {
//     DefaultTransactionSubmitter,
//     ChannelAccountsTransactionSubmitter,
//     ChannelAccountsHandler,
//   },
// };
