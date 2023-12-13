# Channel Accounts Transaction Submitter

### ChannelAccountsTransactionSubmitter Class Overview

The `ChannelAccountsTransactionSubmitter` class, implementing the `TransactionSubmitter` interface, is specifically designed for submitting transactions using a pool of channel accounts. This class is vital in scenarios where high transaction throughput is required on the Stellar network. It manages multiple channel accounts to parallelize transaction submissions, optimizing network interactions and reducing potential sequence errors. \
\
For more in-depth information refer to Stellar's official documentation on [Channel Accounts](https://developers.stellar.org/docs/encyclopedia/channel-accounts).



{% hint style="info" %}
See the [bulk-payments.md](../../tutorials/bulk-payments.md "mention") tutorial on how this class can be utilized to perform several payments in parallel
{% endhint %}

### Core Functionalities

*   #### Constructor

    * **Parameters**:
      * `network`: Configuration for the Stellar network.
      * `feeBump` (optional): Details for fee bumping transactions.\


    #### registerChannels

    * **Purpose**: Adds channel accounts to the pool for transaction processing.
    * **Parameters**: `channels` (Array of `DefaultAccountHandler`).\


    #### createEnvelope

    * **Purpose**: Creates a transaction envelope using a channel account.
    * **Parameters**: `txInvocation` (TransactionInvocation).
    * **Returns**: Object containing `TransactionBuilder` and updated transaction invocation.\


    #### submit

    * **Purpose**: Submits a transaction to the Stellar network.
    * **Parameters**: `envelope` (Transaction or FeeBumpTransaction).
    * **Returns**: Response from the Horizon server.\


    #### postProcessTransaction

    * **Purpose**: Handles the response after transaction submission.
    * **Parameters**: `response` (HorizonNamespace.SubmitTransactionResponse).
    * **Returns**: Processed transaction data or error on failure.\


    #### noChannelPipeline

    * **Purpose**: Provides a fallback mechanism when no free channel is available.
    * **Returns**: Allocated `DefaultAccountHandler` after a waiting period.\


    #### getChannels

    * **Purpose**: Retrieves the list of registered channel accounts.
    * **Returns**: Array of `DefaultAccountHandler`.\


    The `ChannelAccountsTransactionSubmitter` plays a critical role in the transaction processing pipeline, especially when handling high volumes of transactions. It ensures efficient transaction submission by utilizing channel accounts, and it manages the allocation and release of these accounts to optimize network throughput.

### How to use

1.  **Create TransactionSubmitter Instance**: Instantiate the `ChannelAccountsTransactionSubmitter` with the Stellar network configuration and optional fee bump settings.

    {% code overflow="wrap" %}
    ```typescript
    const transactionSubmitter = new
        StellarPlus.Core.Classic.ChannelAccountsTransactionSubmitter(network,
        defaultFeeBump);
    ```
    {% endcode %}
2.  **Register Channel Accounts**: Initialize and register channel accounts for transaction processing. This step is crucial for handling high-frequency transactions.

    {% code overflow="wrap" %}
    ```typescript
    await transactionSubmitter.registerChannels(
      await StellarPlus.Utils.ChannelAccountsHandler.openChannels({ 
      /* ... */ })
    );
    ```
    {% endcode %}
3.  **Use the Submitter:** Provide the submitter to a Soroban class that extends the [soroban-transaction-processor.md](soroban-transaction-processor.md "mention") and accepts a Submitter instance. All transactions processed by this instance will make use of the channel accounts.

    {% code overflow="wrap" %}
    ```typescript
    const cakeToken = new StellarPlus.Asset.ClassicAssetHandler(
        "CAKE",
        issuerAccount.getPublicKey(),
        network,
        issuerAccount,
        transactionSubmitter
      );

    ```
    {% endcode %}
