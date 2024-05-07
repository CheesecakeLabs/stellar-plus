# Bulk Payments

In this tutorial, we'll demonstrate how to execute bulk payments on the Stellar network using the StellarPlus library. We'll create an example to issue an asset and then perform multiple payments to a user account, showcasing the efficiency and scalability of the Stellar network for handling numerous transactions.

{% hint style="info" %}
**Tip:** Before trying this tutorial, make sure you have experimented with [issuing-your-first-asset.md](issuing-your-first-asset.md "mention") and understand the main concepts behind it.
{% endhint %}

## Prerequisites

* **Basic understanding of Stellar concepts**: Familiarize with Stellar network fundamentals, including assets, accounts, trustlines, and transactions. For more in-depth information, especially on asset issuance and control, refer to Stellar's official documentation on [Asset Design Considerations](https://developers.stellar.org/docs/issuing-assets/control-asset-access).
  * **Channel accounts:**  Understanding how channel accounts can be used to enable bulk transactions to be executed in the Stellar network. For more in-depth information refer to Stellar's official documentation on [Channel Accounts](https://developers.stellar.org/docs/encyclopedia/channel-accounts).
  * **Fee bump transactions**: Understanding how fee bump transactions can be used to redirect network costs to be covered by a central account during transaction processing. For more in-depth information refer to Stellar's official documentation on [Fee Bump Transactions](https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions).
* **Node.js environment**: Set up a Node.js environment to run your JavaScript code.&#x20;
* **Stellar Plus library**: Ensure that the StellarPlus library is installed in your project. For the installation steps, refer to [quick-start.md](../quick-start.md "mention").

## Step-by-Step Guide

### Step 1: Initializing the Accounts

The first step in our bulk payments example is to initialize an account to cover the operational expenditure, here, we're naming it the opex account. This account plays a crucial role in managing the operations of our bulk payment process.

```typescript
const networkConfig = StellarPlus.Network.TestNet();

console.log("Initializing opex account");
const opexAccount = new StellarPlus.Account.DefaultAccountHandler({
  networkConfig,
});
await opex.initializeWithFriendbot();

```

#### Explanation:

* **Opex Account Initialization**: Create and initialize the underlying opex account using StellarPlus tools. The `friendbot` function is utilized to fund this account on the testnet.

This step establishes the primary account required for handling the core setup of our bulk payments process.

### Step 2: Opening Channel Accounts and Setting up the Plugin

After initializing the opex account, the next step involves opening a number of channel accounts to be used as resources for submitting transactions and initializing the Channel Accounts plugins, which automatically manage these accounts and handles each transaction.

```typescript
const defaultFeeBump = {
  header: {
    source: opex.getPublicKey(),
    fee: "10000",
    timeout: 45,
  },
  signers: [opex],
};

const channels = await StellarPlus.Utils.ChannelAccountsHandler.openChannels({
    numberOfChannels: 15,
    sponsor: opex,
    networkConfig,
    txInvocation: defaultFeeBump,
});

const channelAccountsPlugin =
  new StellarPlus.Utils.Plugins.classicTransaction.channelAccounts({
    channels,
  } as ChannelAccountsPluginConstructorArgs);
```

#### Explanation:

* **Default Fee Bump Configuration**:  Configure the default settings for transaction fees, source account, and timeout. Here, by defining a transaction invocation object as a default Fee Bump and combining it with the [Fee Bump Wrapper Plugin](../reference/utils/plugins/fee-bump-plugin.md) , we ensure that all transactions will be wrapped with this fee bump configuration in case none is explicitly provided at the invocation.\
  \
  This allows us to ensure that when performing our subsequent transactions with this configuration, all fee costs will be redirected and covered by our central opex account.\

* **Channels**: With the assistance of the `ChannelAccountsHandler`, we initialize a number of channel accounts. This tool creates these accounts using the provided opex account handler, sponsoring the reserves and initializing them with zero funds. With this configuration, we're sure these accounts won't directly handle any lumens and only be used as channels for the transactions. If a personalized configuration is necessary, one could create their own channel accounts and simply arrange an array of `AccountHandler` objects with the capability to sign on behalf of the channels.\

* **Initializing the plugin**: The channels are then provided to the [Classic Channel Accounts plugin](../reference/utils/plugins/channel-accounts-plugin.md), creating a new instance of the plugin that can be used in classic transaction pipelines to automatically manage the transactions' usage of channel accounts.

This step is critical for ensuring that the bulk payment process is efficient and scalable, leveraging Stellar's capabilities for handling multiple simultaneous transactions.

### Step 3: Initializing Issuer and User Accounts

Following the setup of the transaction submitter and channel accounts, the next step is to initialize the issuer account for the asset and the user account that will receive the bulk payments.

```typescript
const issuerAccount = new StellarPlus.Account.DefaultAccountHandler({
  networkConfig,
});
await issuerAccount.initializeWithFriendbot();

const userAccount = new StellarPlus.Account.DefaultAccountHandler({
  networkConfig,
});
await userAccount.initializeWithFriendbot();
```

#### Explanation:

* **Issuer Account Initialization**: Create and initialize the issuer account. This account is responsible for issuing the asset (in our case, 'CAKE').
* **User Account Initialization**: Similarly, create and initialize the user account. This account will be the recipient of the bulk payments in the form of the issued asset.

These steps ensure that both the issuer of the asset and the recipient of the payments are set up and ready to participate in the upcoming transactions.



### Step 4: Creating the Asset and Configuring the Transaction

After initializing the necessary accounts, the next step involves creating the asset and setting up the transaction configuration.

```javascript
  const cakeToken = new StellarPlus.Asset.ClassicAssetHandler({
    code: "CAKE",
    networkConfig,
    issuerAccount,
    options: {
      classicTransactionPipeline: {
        plugins: [
          channelAccountsPlugin,
          new FeeBumpWrapperPlugin(defaultFeeBump),
        ],
      },
    },
  });

const txInvocationConfig = {
  header: {
    source: userAccount.getPublicKey(),
    fee: "1000",
    timeout: 30,
  },
  signers: [userAccount],
};

await cakeToken.addTrustlineAndMint({
    to: userAccount.getPublicKey(),
    amount: 100,
    ...txInvocationConfig,
  });
```

#### Explanation:

* **Creating the Asset**: Instantiate the 'CAKE' asset using `ClassicAssetHandler`. This step involves specifying the asset's name, the issuer's public key, the network, and the issuer account, and providing the plugins to be used in this asset's transaction pipeline. This is very important for this use case because these plugins will act as middleware in the transaction pipeline ensuring all transactions are modified in the same way. &#x20;
  * The [Channel Accounts plugin](../reference/utils/plugins/channel-accounts-plugin.md) will be responsible for allocating and managing the channels accounts.&#x20;
  * The [Fee Bump Wrapper plugin](../reference/utils/plugins/fee-bump-plugin.md) will ensure that all transactions are wrapped in a fee bump and redirect the fees to the opex account. Here we're utilizing this plugin as well because all accounts created through the `ChannelAccountsHandler` are sponsored and hold no lumens, so we need a fee bump to cover the network fees.\

* **Setting Up Transaction Configuration**: Define the transaction invocation configuration, including the source account (user account), fee, and timeout settings. This object is meant to facilitate transactions involving this account.\

* **Adding Trustline and Minting**: Add a trustline for the 'CAKE' asset to the user account and mint an initial amount of the asset. This step is crucial to enable the user account to hold and transact in the newly created asset. \
  \
  It is also important to note that to authorize the creation of the asset trustline, the transaction needs to be authorized by the asset issuer so, as we have initialized the asset with an `AccountHandler` of the asset issuer, the Asset will automatically include the issuer wherever necessary and authorize the transactions on their behalf.

This step finalizes the asset creation process and prepares the user account to receive and hold the asset, setting the stage for executing the bulk payments.

### Step 5: Executing Bulk Payments

The next crucial step is to execute the bulk payments. We will mint the 'CAKE' asset in varying amounts and send it to the user account.

```typescript
for (let i = 0; i < 100; i++) {
  const amount = Math.floor(Math.random() * (100 - 5 + 1) + 5); // random amount between 5 to 100

  cakeToken
    .mint({
      to: userAccount.getPublicKey(), 
      amount, 
      ...txInvocationConfig
    })
    .then((result) => {
      console.log("Minted: ", amount);
    });
}
```

#### Explanation:

* **Bulk Payments Loop**: Iterate 100 times to simulate bulk payments.
* **Minting Random Amounts**: For each iteration, generate a random amount of 'CAKE' tokens (between 5 and 100) and mint them to the user account.
* **Logging the Minting**: After each minting operation, log the amount minted to keep track of the transactions.

This step efficiently handles multiple minting transactions, showcasing the asset distribution process in a bulk payment scenario.

### Extra step: Reviewing the Bulk Payment Process

After executing the bulk payments, the extra final step is to go back and add a few logs conclude the operation, and review the steps as they're being executed.

#### Snippet for Step 6:

```javascript
const initialTime = Date.now();
const payments = [];
console.log(
  "Trigger 100 payments to userAccount: ",
  userAccount.getPublicKey()
);

for (let i = 0; i < 100; i++) {
  const amount = Math.floor(Math.random() * (100 - 5 + 1) + 5); // random amount between 5 to 100
  payments.push(
    cakeToken
      .mint({
        to: userAccount.getPublicKey(), 
        amount, 
        ...txInvocationConfig
      })
      .then((result) => {
        console.log("Minted: ", amount);
      })
  );
}

await Promise.all(payments);
const finalTime = Date.now();
const time = finalTime - initialTime;
console.log("Total Time(ms): ", time);
console.log(
  "User Account Balance: ",
  await cakeToken.balance(userAccount.getPublicKey())
);

```

#### Explanation:

* **Awaiting Payment Completion**: Encapsulate all the async functions and use `await Promise.all(payments)` to ensure all payment transactions are completed. This line should be placed after the loop where the payments are initiated.
* **Time Calculation and Logging**: Calculate the total time taken for all transactions to complete, from the initial time recorded before the loop to the final time recorded after `Promise.all`. This time measurement provides insight into the efficiency of the bulk payment process.\
  Under normal conditions of the Stellar testnet, <mark style="color:orange;">**the total time for these 100 payments should be under 1 minute**</mark>.
* **Balance Check**: Finally, log the balance of the user account to verify that it has received all the payments correctly.

This step provides an overview of the operation's effectiveness and ensures that all transactions have been successfully processed. It's a crucial part of validating the bulk payment operation.

Also, by logging your user account's public key so you can copy and look for it in the stellar explorer [Stellar Expert](https://stellar.expert/explorer/testnet/). Searching for the public key in the Stellar Expert should display the account with all of its historical data, balances, and more.

## Complete Example

Below is the complete code snippet, incorporating all the steps previously outlined and adding a few logging lines to visualize each step as it is executed. This example is structured within a single asynchronous function to accommodate the multiple asynchronous operations involved. By doing so, we can effectively use `await` for each step, ensuring that each operation is executed in a sequential and organized manner.&#x20;

{% code lineNumbers="true" %}
```typescript
import { StellarPlus } from "stellar-plus";
import { ChannelAccountsPluginConstructorArgs } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/soroban-transaction/channel-accounts/types";
import { FeeBumpWrapperPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/submit-transaction/fee-bump";

const run = async () => {
  const networkConfig = StellarPlus.Network.TestNet();

  console.log("Initializing opex account");
  const opex = new StellarPlus.Account.DefaultAccountHandler({
    networkConfig,
  });
  await opex.initializeWithFriendbot();

  const defaultFeeBump = {
    header: {
      source: opex.getPublicKey(),
      fee: "10000",
      timeout: 45,
    },
    signers: [opex],
  };

  console.log("Opening Channels");

  const channels = await StellarPlus.Utils.ChannelAccountsHandler.openChannels({
    numberOfChannels: 15,
    sponsor: opex,
    networkConfig,
    txInvocation: defaultFeeBump,
  });

  const channelAccountsPlugin =
    new StellarPlus.Utils.Plugins.classicTransaction.channelAccounts({
      channels,
    } as ChannelAccountsPluginConstructorArgs);

  console.log("Initializing issuer account");
  const issuerAccount = new StellarPlus.Account.DefaultAccountHandler({
    networkConfig,
  });
  await issuerAccount.initializeWithFriendbot();

  console.log("Initializing userAccount account");
  const userAccount = new StellarPlus.Account.DefaultAccountHandler({
    networkConfig,
  });

  await userAccount.initializeWithFriendbot();

  const txInvocationConfig = {
    header: {
      source: userAccount.getPublicKey(),
      fee: "1000",
      timeout: 45,
    },
    signers: [userAccount],
  };

  const cakeToken = new StellarPlus.Asset.ClassicAssetHandler({
    code: "CAKE",
    networkConfig,
    issuerAccount,
    options: {
      classicTransactionPipeline: {
        plugins: [
          channelAccountsPlugin,
          new FeeBumpWrapperPlugin(defaultFeeBump),
        ],
      },
    },
  });

  await cakeToken.addTrustlineAndMint({
    to: userAccount.getPublicKey(),
    amount: 100,
    ...txInvocationConfig,
  });

  const initialTime = Date.now();
  const payments = [];
  console.log(
    "Trigger 100 payments to userAccount: ",
    userAccount.getPublicKey()
  );
  for (let i = 0; i < 100; i++) {
    const amount = Math.floor(Math.random() * (100 - 5 + 1) + 5); // random amount between 5 to 100
    payments.push(
      cakeToken
        .mint({
          to: userAccount.getPublicKey(),
          amount,
          ...txInvocationConfig,
        })
        .then((result) => {
          console.log("Minted: ", amount);
        })
    );
  }

  await Promise.all(payments);
  const finalTime = Date.now();
  const time = finalTime - initialTime;
  console.log("Total Time(ms): ", time);
  console.log(
    "User Account Balance: ",
    await cakeToken.balance(userAccount.getPublicKey())
  );
};

run();
```
{% endcode %}

