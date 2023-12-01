// Import your classes and types
import { DefaultTransactionSubmitter as _DefaultTransactionSubmitter } from "./transaction-submitter/classic/default";
import { ChannelAccountsTransactionSubmitter as _ChannelAccountsTransactionSubmitter } from "./transaction-submitter/classic/channel-accounts-submitter";

import type { TransactionSubmitter as _TransactionSubmitter } from "./transaction-submitter/classic/types";

// Define the Core namespace
export namespace Core {
  export namespace Classic {
    export class DefaultTransactionSubmitter extends _DefaultTransactionSubmitter {}
    export class ChannelAccountsTransactionSubmitter extends _ChannelAccountsTransactionSubmitter {}
    export type TransactionSubmitter = _TransactionSubmitter;
  }
}
