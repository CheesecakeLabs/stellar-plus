# Channel Accounts Plugin

<figure><img src="../../../.gitbook/assets/image (12).png" alt=""><figcaption></figcaption></figure>

The Channel Accounts plugin can be used to modify transactions to use one of multiple channel accounts, avoiding sequence number clashing when executing multiple transactions in parallel for a given account. Refer to Stellar's official documentation on [channel accounts](https://developers.stellar.org/docs/encyclopedia/channel-accounts) for further details.



* Pipeline Type:&#x20;
  * [classic-transaction.md](../../core/pipelines/classic-transaction.md "mention")- ClassicChannelAccountsPlugin
  * [soroban-transaction.md](../../core/pipelines/soroban-transaction.md "mention") - SorobanChannelAccountsPlugin (Not fully supported yet)



## Setup

During instantiation(or later by invoking the `registerChannels` method, an array of `AccountHandler` can be provided to register channel accounts to be used by this plugin. The Channel Account Handler util can be used to create and delete channels.

## preProcess

During the `preProcess` step the Channel Accounts plugin allocates one of its free channels to be used for this transaction and injects it as the source of the transaction as well as a signer.

In case no channel is free, the plugin will wait for a second before checking again.

## postProcess

The original channel allocated for this transaction is then released and set back as a free channel for the next transaction.

## processError

The original channel allocated for this transaction is then released and set back as a free channel for the next transaction.

