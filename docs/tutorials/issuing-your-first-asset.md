# Issuing your first asset

In this tutorial, we'll walk through the steps of issuing and minting the initial supply for your first digital asset on the Stellar network using the StellarPlus library. We'll be creating a custom asset, in this case, a token named "CAKE", and setting up an issuer and a distribution account. Let's dive in.

## Prerequisites

* **Basic Understanding of Stellar Concepts**: Familiarize yourself with Stellar network fundamentals, including assets, accounts, trustlines, and transactions. For more in-depth information, especially on asset issuance and control, refer to Stellar's official documentation on [Asset Design Considerations](https://developers.stellar.org/docs/issuing-assets/control-asset-access).
* **Node.js Environment**: Set up a Node.js environment to run your JavaScript code.&#x20;
* **StellarPlus Library**: Ensure that the StellarPlus library is installed in your project. For the installation steps, refer to [quick-start.md](../quick-start.md "mention").

## Step-by-Step Guide

### Step 1: Import StellarPlus and Set Up Network

First, import the necessary components from the StellarPlus library and set the network to testnet for experimentation.

{% code overflow="wrap" %}
```typescript
import { StellarPlus } from "stellar-plus";

const networkConfig = StellarPlus.Network.TestNet();
```
{% endcode %}

### Step 2: Create Issuer and Distribution Accounts

Create two accounts - one for issuing the asset (issuerAccount) and another for distributing it (distributionAccount). Initialize both accounts using the [Broken link](broken-reference "mention") helper, which is especially useful on the testnet as it funds the accounts with test Lumens.

```typescript
issuerAccount = new StellarPlus.Account.DefaultAccountHandler({networkConfig});
await issuerAccount.initializeWithFriendbot();

const distributionAccount = new StellarPlus.Account.DefaultAccountHandler({networkConfig});
await distributionAccount.initializeWithFriendbot();
```

### Step 3: Define Your Asset

Create an instance of your asset, specifying the asset code(here named 'CAKE '), issuing account's public key, network, and the issuer account handler.&#x20;

```typescript
const cakeToken = new StellarPlus.Asset.ClassicAssetHandler({
  code: 'CAKE',
  networkConfig,
  issuerAccount
});
```

The issuer account handler is an optional parameter when instancing assets but in this use case, it is necessary because it enables the management functionalities of the asset that require the issuer's approval.

### Step 4: Set Up Transaction Invocation Configuration

Configure the transaction details including the source account, fee, and timeout. Also, specify the distribution account as the signer.

```typescript
const txInvocationConfig = {
  header: {
    source: distributionAccount.getPublicKey(),
    fee: "1000",
    timeout: 45,
  },
  signers: [distributionAccount],
};
```

These parameters are used to bundle the underlying Stellar transaction and define how it should be configured. It is a useful artifact to allow for different configuration strategies to be used for each transaction, varying how you pay for fees and authorize transactions.

### Step 5: Add Trustline and Mint the Asset

Create a trustline from the distribution account to the CAKE asset and mint 1,000,000 units of CAKE to the distribution account.

```typescript
await cakeToken.addTrustlineAndMint({
    to: distributionAccount.getPublicKey(),
    amount: 1000000,
    ...txInvocationConfig,
  });
```

### Step 6: Check Balance

Finally, verify the balance of the distribution account to confirm that it has received the CAKE tokens.

<pre class="language-typescript"><code class="lang-typescript"><strong>console.log(
</strong>  "Distribution account balance: ",
  await cakeToken.balance(distributionAccount.getPublicKey())
);

</code></pre>

### Extra Step: See the transaction in the blockchain

As a last additional step, log your distribution account's public key so you can copy and look for it in the stellar explorer [Stellar Expert](https://stellar.expert/explorer/testnet/).

```typescript
console.log("Public key: ", distributionAccount.getPublicKey());
```

Searching for the public key in the Stellar Expert should display the account with all of its historical data, balances, and more.

<figure><img src="../.gitbook/assets/image (15).png" alt=""><figcaption><p>Distribution account as seen in the Stellar Expert</p></figcaption></figure>

## Complete Example

Below is the complete code snippet, encapsulating all the steps outlined in the previous section. As it involves several asynchronous function calls, we've enclosed the entire process within a single asynchronous function. This approach allows us to use `await` for each operation, ensuring that they execute sequentially.

{% code lineNumbers="true" %}
```typescript
import { StellarPlus } from "stellar-plus";

const run = async () => {
  const networkConfig = StellarPlus.Network.TestNet();

  const issuerAccount = new StellarPlus.Account.DefaultAccountHandler({
    networkConfig,
  });
  await issuerAccount.initializeWithFriendbot();

  const distributionAccount = new StellarPlus.Account.DefaultAccountHandler({
    networkConfig,
  });
  await distributionAccount.initializeWithFriendbot();

  const cakeToken = new StellarPlus.Asset.ClassicAssetHandler({
    code: "CAKE",
    networkConfig,
    issuerAccount,
  });

  const txInvocationConfig = {
    header: {
      source: distributionAccount.getPublicKey(),
      fee: "1000",
      timeout: 45,
    },
    signers: [distributionAccount],
  };

  await cakeToken.addTrustlineAndMint({
    to: distributionAccount.getPublicKey(),
    amount: 1000000,
    ...txInvocationConfig,
  });

  console.log(
    "Distribution account balance: ",
    await cakeToken.balance(distributionAccount.getPublicKey())
  );

  console.log("Public key: ", distributionAccount.getPublicKey());
};

run();

```
{% endcode %}
