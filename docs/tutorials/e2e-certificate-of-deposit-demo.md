# E2E Certificate of Deposit demo

In this tutorial, we'll demonstrate an end-to-end approach to deploy and interact with a certificate of deposit contract. This demo covers several steps such as configuring the necessary accounts, deploying and initializing the contract, up to interact as an end-user investing in the CD.

## Prerequisites

* **Basic Understanding of Stellar Concepts**: Familiarize yourself with Stellar network fundamentals, including assets, accounts, trustlines, and transactions. For more in-depth information, refer to [Stellar's official documentation](https://developers.stellar.org/docs).
* **Basic understanding of Stellar's Soroban:**  Familiarize yourself with Soroban and how smart contracts integrate with the Stellar network. For more in-depth information refer to [Soroban's official documentation](https://soroban.stellar.org/docs).
* **Node.js Environment**: Set up a Node.js environment to run your JavaScript code.&#x20;
* **StellarPlus Library**: Ensure that the StellarPlus library is installed in your project. For the installation steps, refer to [quick-start.md](../quick-start.md "mention").

## Objectives

Our target with this demo is to exemplify a direct workflow to how the Stellar Plus library might assist in different parts of developing a Stellar solution. Here we'll focus on few key objectives:

**Core**

1. Upload a wasm file of the compiled Certificate of Deposit smart contract;
2. Deploy a new instance of this contract and initialize it with custom parameters;
3. Creating and wrapping a Stellar classic asset into a 'Stellar Asset Contract'';
4. Simulate a user account performing a deposit and opening a position;
5. Watching the interest rate being applied to the user position;
6. Withdrawing before the end term and facing the penalty;

**Secondary**

7. Create and fund the asset issuer account;
8. Create, set up and fund account to manage the contract;
9. Create, set up and fund account to simulate the User;
10. Create an Opex (operational expenditure) account to cover all of the transaction fees in the demo;

**Bonus**

11. Use a third-party RPC ([Validation Cloud](https://www.validationcloud.io/))

## Step-by-Step Guide

### Initial Setup

#### Step 1: Creating the Opex account

In this first step, we'll start by defining which network we'll be operating in this demo, which for now is the `testnet`. Then we'll start a new account handler to manage the Opex account and initialize it with friendbot.\
\
Once the account is fully created and funded, we'll then creat a `TransactionInvocation` object for transactions made by the Opex account. This object will also be used to define the Fee Bump strategy for the subsequent transactions processed.

{% code lineNumbers="true" %}
```typescript
const network = StellarPlus.Constants.testnet

const opex = new StellarPlus.Account.DefaultAccountHandler({
  network,
})
await opex.friendbot?.initialize()

const opexTxInvocation = {
  header: {
    source: opex.getPublicKey(),
    fee: '10000000', //1 XLM as maximum fee
    timeout: 30,
  },
  signers: [opex],
}
```
{% endcode %}

#### Step 2: Creating and Wrapping an Asset

Here we also initialize a new account handler to manage the asset issuer account, then we initialize a new asset using the SACHandler(Stellar Asset Contract) which allows use to perform both Classic and Soroban actions for this asset.\
\
At the end, we wrap this Stellar classic asset into a default asset contract so it can interact directly with smart contracts.

{% code lineNumbers="true" %}
```typescript
const issuer = new StellarPlus.Account.DefaultAccountHandler({ network })
await issuer.friendbot?.initialize()

const cakeToken = new StellarPlus.Asset.SACHandler({
  code: 'CAKE',
  issuerPublicKey: issuer.getPublicKey(),
  network,
  issuerAccount: issuer,
})

await cakeToken.wrapAndDeploy(opexTxInvocation)
```
{% endcode %}

#### Step 3: Create a vault to manage the CD contract and the funds

Similarly to the other accounts, we initiate a new account called `codVault`, which will act as the CD admin and also manage the funds from the deposits and withdrawals.\
\
After the account initialization, we use the asset handler to add a trustline and mint some token units directly to the vault. This asset management function is available because the issuer account handler was provided during the asset initialization.

```typescript
const codVault = new StellarPlus.Account.DefaultAccountHandler({ network })
await codVault.friendbot?.initialize()

const codTxInvocation = {
  header: {
    source: codVault.getPublicKey(),
    fee: '1000000', //0.1 XLM as maximum fee
    timeout: 30,
  },
  signers: [codVault],
  feeBump: opexTxInvocation,
}

await cakeToken.classicHandler.addTrustlineAndMint(codVault.getPublicKey(), 10000000, codTxInvocation)
```

A key element in this step is the definition of a 'Transaction Invocation' object for the vault account, which uses the vault account as the source and also introduces the vault as a signer. The Opex transaction invocation object is introduced here as a feeBump in this case, ensuring that all codVault invocations are covered by the Opex account.\
\
Another important highlight is that while the `codTxInvocation` object will ensure the vault is signing to authorize the trustline creation, the asset itself will be responsible for including the issuer account and signature to authorize the minting.



### Creating a Certificate of Deposit dApp

#### Step 4: Uploading and deploy an instance of the contract code

Here, we start by loading the compiled wasm file from a local folder. You can use the following file in your demo.

{% file src="../.gitbook/assets/certificates_of_deposit.optimized.wasm" %}
Compiled WASM for the Certificate of Deposit contract
{% endfile %}

Once the file is loaded into a buffer, we initialize the CD client with the wasm buffer and upload it to the  Stellar network. This will provide us with a unique wasm hash that identifies this code and can be used to deploy instances of this implementation on chain. This attribute is automatically stored in the client object for future usage.

{% code lineNumbers="true" %}
```typescript
const wasmFilePath = './src/wasm-files/certificates_of_deposit.optimized.wasm'
const wasmBuffer = await loadWasmFile(wasmFilePath)

const codClient = new StellarPlus.Contracts.CertificateOfDeposit({
  network,
  wasm: wasmBuffer,
})

await codClient.uploadWasm(codTxInvocation)

await codClient.deploy(codTxInvocation)
```
{% endcode %}

Right after, a deploy is triggered then, instaciating a new contract and getting a unique contract id to interact with this new certificate of deposit dApp.

{% hint style="info" %}
In this step, we make use of a complimentary function to load the wasm file and return a buffer. The function is the following one:

{% code lineNumbers="true" fullWidth="false" %}
```typescript
async function loadWasmFile(wasmFilePath: string): Promise<Buffer> {
  try {
    const buffer = await readFile(wasmFilePath)
    return buffer
  } catch (error) {
    throw error
  }
}
```
{% endcode %}
{% endhint %}

#### Step 5: Initialize the CD Contract

Now that we have a fresh new instance of the contract, we need to initialize its state with the parameters to how this contract will operate. For this we first use a sorobanHandler to load the latest ledger sequence and set a future expiration ledger for the allowance that enables the contract to move the codVault's funds.

Then, we set the main parameters expected by the contract initialization. These parameters define the following characteristics for this instance of the CD:\


* **Admin**: codVault\
  Defines which account can manage the CD contract and also receives and provides the funds from/to the users.
* **Asset**: cakeToken's contract id\
  The contract id of the Stellar Asset Contract for the wrapped Classic Asset this CD interacts with.
* **Term**: 600 seconds\
  For how long this CD will accrue interest to a open deposit position.
* **Compound Step:** 4 seconds\
  How often will the interest be paid/compound. If set to '0', a different yield rate calculation is used and the interest rate will be applied linearly until the end of the term.
* **Yield Rate**: 15 (0.15%)\
  How much interest will be paid out. For compounding interest, this means at every compound interval, while the linear rate will reach this rate at the end of the term.
* **Minimum Deposit**: 100 units\
  Minimum amount accepted for a deposit.
* **Penalty Rate**: 5000 (50%)\
  If a user accepts the early withdraw, before the term is finished, this penalty rate will be applied to the earned interest. E.g.  _A 200 units position (100 deposit + 100 earned yield) withdrawing early with a penalty rate of 50% will receive 150 units(100 deposit + 50 earned yield)_&#x20;

$$
Withdrawn Amount=Deposit+(Yield−Penalty Rate×Yield)
$$

* **Allowance Period**: Latest ledger + 200.000\
  Until which ledger will the allowance for the contract to access the codVault's funds be valid.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
const sorobanHandler = new StellarPlus.SorobanHandler(network)
const expirationLedger = (await sorobanHandler.server.getLatestLedger()).sequence + 200000

const codParams = {
  admin: codVault.getPublicKey(),
  asset: cakeToken.getContractId(),
  term: BigInt(600) as bigint,
  compoundStep: BigInt(4) as bigint,
  yieldRate: BigInt(15) as bigint,
  minDeposit: BigInt(100 * 10 ** 7) as bigint,
  penaltyRate: BigInt(5000) as bigint,
  allowancePeriod: expirationLedger,
}

await codClient.initialize({ ...codParams, ...codTxInvocation })
```
{% endcode %}

### User interacts with the contract

#### Step 6: Setup a user account

Just as we did before, we initialize user account and set up the necessary trustline and 'Transaction Invocation' object.\


{% code overflow="wrap" lineNumbers="true" %}
```typescript
const userAccount = new StellarPlus.Account.DefaultAccountHandler({ network })
await userAccount.friendbot?.initialize()

const userTxInvocation = {
  header: {
    source: userAccount.getPublicKey(),
    fee: '1000000', //0.1 XLM as maximum fee
    timeout: 30,
  },
  signers: [userAccount],
  feeBump: opexTxInvocation,
}

console.log('Depositing 10000 CAKE tokens to user account...')
await cakeToken.classicHandler.addTrustlineAndMint(userAccount.getPublicKey(), 10000000, userTxInvocation)
```
{% endcode %}

#### Step 7: Deposit and check open position

The user then performs a deposit of 1000 CAKEs and right after, checks their open position in the CD.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
await codClient.deposit({
  address: userAccount.getPublicKey(),
  amount: BigInt(1000 * 10 ** 7) as bigint,
  ...userTxInvocation,
})

console.log(
  'User position in the certificate of deposit: ',
  (await codClient.getPosition({ address: userAccount.getPublicKey(), ...userTxInvocation })) /
    10 ** (await cakeToken.decimals())
)
```
{% endcode %}

#### Step 8: Wait a few seconds and withdraws

After enough time is passed, we check the estimated yield that has accrued in the CD and perform an early withdrawal by accepting the penalty.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
setTimeout(async () => {
  console.log(
    'User has earned and estimated yield of:',
    (await codClient.getEstimatedYield({ address: userAccount.getPublicKey(), ...userTxInvocation })) /
      10 ** (await cakeToken.decimals())
  )

  console.log('User withdraws from Certificate of Deposit vault (with early withdrawal penalty)...')
  await codClient.withdraw({
    address: userAccount.getPublicKey(),
    acceptPrematureWithdraw: true,
    ...userTxInvocation,
  })
```
{% endcode %}

### Bonus

#### Step 9: Use Validation Cloud's RPC&#x20;

For this step just as a fun bonus, instead of using SDF's testnet RPC, we'll instead switch to the ready-to-use integration with [Validation Cloud](https://www.validationcloud.io/). For this, you just need to create an account under their free tier and generate an API key for their Soroban API.

With your own key, we'll just go back to Step 4 and make some slight changes. We'll initialize a custom Validation Cloud RPC handler providing our API key. Then we just need to provide this handler and optional argument when initializing our CD client.\
\
Since the CD client extends the [contract-engine.md](../reference/contracts/contract-engine.md "mention"), it'll automatically ensure this handler is used to perform all direct interactions with the RPC such as simulating and submitting transactions.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
const wasmFilePath = './src/wasm-files/certificates_of_deposit.optimized.wasm'
const wasmBuffer = await loadWasmFile(wasmFilePath)

const vcRpcHandler = new StellarPlus.RPC.ValidationCloudRpcHandler(
  network,
  '<YOUR API KEY>'
)

const codClient = new StellarPlus.Contracts.CertificateOfDeposit({
  network,
  wasm: wasmBuffer,
  rpcHandler: vcRpcHandler,
})
```
{% endcode %}

### Complete Example

Below is the complete code snippet, incorporating all the steps previously outlined and adding a few logging lines to visualize each step as it is executed. This example is structured within a single asynchronous function to accommodate the multiple asynchronous operations involved. By doing so, we can effectively use `await` for each step, ensuring that each operation is executed in a sequential and organized manner.&#x20;



{% code overflow="wrap" lineNumbers="true" %}
```typescript
import { readFile } from 'fs/promises'
import { StellarPlus } from './'

async function loadWasmFile(wasmFilePath: string): Promise<Buffer> {
  try {
    const buffer = await readFile(wasmFilePath)
    return buffer
  } catch (error) {
    throw error
  }
}

const run = async (): Promise<void> => {
  const network = StellarPlus.Constants.testnet

  console.log('Initializing opex account...')
  const opex = new StellarPlus.Account.DefaultAccountHandler({
    network,
  })
  await opex.friendbot?.initialize()

  const opexTxInvocation = {
    header: {
      source: opex.getPublicKey(),
      fee: '10000000', //1 XLM as maximum fee
      timeout: 30,
    },
    signers: [opex],
  }

  const issuer = new StellarPlus.Account.DefaultAccountHandler({ network })
  console.log('Initializing issuer account... ', issuer.getPublicKey())
  await issuer.friendbot?.initialize()

  const cakeToken = new StellarPlus.Asset.SACHandler({
    code: 'CAKE',
    issuerPublicKey: issuer.getPublicKey(),
    network,
    issuerAccount: issuer,
  })
  console.log('Wrapping Asset in SAC...')
  const wrappedAssetContractId = await cakeToken.wrapAndDeploy(opexTxInvocation)
  console.log('Wrapped Asset Contract ID: ', wrappedAssetContractId)

  console.log('Initializing Certificate of Deposit vault account...')
  const codVault = new StellarPlus.Account.DefaultAccountHandler({ network })
  await codVault.friendbot?.initialize()

  const codTxInvocation = {
    header: {
      source: codVault.getPublicKey(),
      fee: '1000000', //0.1 XLM as maximum fee
      timeout: 30,
    },
    signers: [codVault],
    feeBump: opexTxInvocation,
  }

  console.log('Adding trustline and tokens to Certificate of Deposit vault...')
  await cakeToken.classicHandler.addTrustlineAndMint(codVault.getPublicKey(), 10000000, codTxInvocation)

  console.log('Vault Balance:', await cakeToken.classicHandler.balance(codVault.getPublicKey()))

  console.log('Loading Wasm file...')
  const wasmFilePath = './src/wasm-files/certificates_of_deposit.optimized.wasm'
  const wasmBuffer = await loadWasmFile(wasmFilePath)

  const vcRpcHandler = new StellarPlus.RPC.ValidationCloudRpcHandler(
    network,
    '<YOUR API KEY>'
  )

  const codClient = new StellarPlus.Contracts.CertificateOfDeposit({
    network,
    wasm: wasmBuffer,
    rpcHandler: vcRpcHandler,
  })

  console.log('Uploading wasm to network...')
  await codClient.uploadWasm(codTxInvocation)

  console.log('Deploying new instance of contract...')
  await codClient.deploy(codTxInvocation)

  const sorobanHandler = new StellarPlus.SorobanHandler(network)
  const expirationLedger = (await sorobanHandler.server.getLatestLedger()).sequence + 200000

  const codParams = {
    admin: codVault.getPublicKey(),
    asset: cakeToken.getContractId(),
    term: BigInt(600) as bigint,
    compoundStep: BigInt(4) as bigint,
    yieldRate: BigInt(15) as bigint,
    minDeposit: BigInt(100 * 10 ** 7) as bigint,
    penaltyRate: BigInt(5000) as bigint,
    allowancePeriod: expirationLedger,
  }

  console.log("initializing contract's state...")
  await codClient.initialize({ ...codParams, ...codTxInvocation })

  console.log('Crreating user account...')
  const userAccount = new StellarPlus.Account.DefaultAccountHandler({ network })
  await userAccount.friendbot?.initialize()

  const userTxInvocation = {
    header: {
      source: userAccount.getPublicKey(),
      fee: '1000000', //0.1 XLM as maximum fee
      timeout: 30,
    },
    signers: [userAccount],
    feeBump: opexTxInvocation,
  }

  console.log('Depositing 10000 CAKE tokens to user account...')
  await cakeToken.classicHandler.addTrustlineAndMint(userAccount.getPublicKey(), 10000000, userTxInvocation)

  console.log('User Balance(CAKE):', await cakeToken.classicHandler.balance(userAccount.getPublicKey()))

  console.log('User Deposits 1000 CAKE tokens to Certificate of Deposit vault...')
  await codClient.deposit({
    address: userAccount.getPublicKey(),
    amount: BigInt(1000 * 10 ** 7) as bigint,
    ...userTxInvocation,
  })

  console.log('User position in the certificate of deposit: ',
    (await codClient.getPosition({ address: userAccount.getPublicKey(), ...userTxInvocation })) /
      10 ** (await cakeToken.decimals())
  )

  console.log('Waiting 5 seconds...')
  setTimeout(async () => {
    console.log(
      'User has earned and estimated yield of:',
      (await codClient.getEstimatedYield({ address: userAccount.getPublicKey(), ...userTxInvocation })) /
        10 ** (await cakeToken.decimals())
    )
    console.log('User withdraws from Certificate of Deposit vault (with early withdrawal penalty)...')
    await codClient.withdraw({
      address: userAccount.getPublicKey(),
      acceptPrematureWithdraw: true,
      ...userTxInvocation,
    })

    console.log('User Balance(CAKE):', await cakeToken.classicHandler.balance(userAccount.getPublicKey()))
  }, 10000)
}
run()
```
{% endcode %}

