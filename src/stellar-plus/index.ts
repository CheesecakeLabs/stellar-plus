import { ChannelAccounts as ChannelAccountsHandler } from '@channel-accounts/index'
import { CertificateOfDepositClient } from '@soroban/contracts/certificate-of-deposit'

export * as Account from '@account/index'
export * as Asset from '@asset/index'
export * as Constants from './constants'
export { HorizonHandlerClient as HorizonHandler } from '@horizon/index'
export { SorobanHandlerClient as SorobanHandler } from '@soroban/index'

export { ContractEngine } from '@core/contract-engine'

export { Core } from '@core/index'

export const Contracts = {
  CertificateOfDeposit: CertificateOfDepositClient,
}

export const Utils = {
  ChannelAccountsHandler,
}

export * as RPC from '@rpc/index'

// export { TransactionInvocation } from '@core/types'

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
