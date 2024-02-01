import { ChannelAccounts as ChannelAccountsHandler } from 'stellar-plus/channel-accounts/index'
import { CertificateOfDepositClient } from 'stellar-plus/soroban/contracts/certificate-of-deposit'

import { pipelineUtils } from './utils/pipeline'
import { plugins } from './utils/pipeline/plugins'

export * as Account from 'stellar-plus/account/index'
export * as Asset from 'stellar-plus/asset/index'
export * as Constants from 'stellar-plus/constants'
export { HorizonHandlerClient as HorizonHandler } from 'stellar-plus/horizon/index'
export { SorobanHandlerClient as SorobanHandler } from 'stellar-plus/soroban/index'

export { Core } from 'stellar-plus/core/index'

export const ContractClients = {
  CertificateOfDeposit: CertificateOfDepositClient,
}

export const Utils = {
  ChannelAccountsHandler,
  Pipeline: pipelineUtils,
  Plugins: plugins,
}

export * as RPC from 'stellar-plus/rpc/index'

export * as Types from 'stellar-plus/types'

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
