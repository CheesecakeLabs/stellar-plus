export * as Constants from "./constants";
export * as Account from "./account";
export * as Asset from "./asset";

export { HorizonHandlerClient as HorizonHandler } from "./horizon";
export { SorobanHandlerClient as SorobanHandler } from "./soroban";

export { ContractEngine } from "./core/contract-engine";

export { Core } from "./core";
import { CertificateOfDepositClient } from "./soroban/contracts/certificate-of-deposit";
export const Contracts = {
  CertificateOfDeposit: CertificateOfDepositClient,
};

import { ChannelAccounts as ChannelAccountsHandler } from "./channel-accounts";

export const Utils = {
  ChannelAccountsHandler,
};

export * as RPC from "./rpc";

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
