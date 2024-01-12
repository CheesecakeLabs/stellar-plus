# Profiling a contract

Monitoring the resources consumed by each transaction in Soroban is crucial to identifying errors related to network limit exceedances, unexpected fee values, or to gain insights into your contract's behavior. In this tutorial, we will explore how to use the Stellar-plus profiler to collect transaction cost metrics for a contract.

## Prerequisites

* **Basic Understanding of Stellar Concepts**: Familiarize yourself with Stellar network fundamentals, including assets, accounts, trustlines, and transactions. For more in-depth information, refer to [Stellar's official documentation](https://developers.stellar.org/docs).
* **Basic understanding of Stellar's Soroban:** Familiarize yourself with Soroban and how smart contracts integrate with the Stellar network. For more in-depth information refer to [Soroban's official documentation](https://soroban.stellar.org/docs).
* **Node.js Environment**: Set up a Node.js environment to run your JavaScript code.
* **StellarPlus Library**: Ensure that the StellarPlus library is installed in your project. For the installation steps, refer to [quick-start.md](../quick-start.md "mention").
* **Contract client**: Ensure that you have the client for the contract you want to profile ready. Refer to [Creating a new contract client](e2e-certificate-of-deposit-demo-1.md) for guidance on building your client.

## Step-by-Step Guide

### Setting the profiler

The first step is to instantiate the client of your contract with the profiler. To illustrate, let's use the Soroban token client which is already implemented in the library.

{% code lineNumbers="true" %}
```typescript
import { StellarPlus } from "stellar-plus";

const network = StellarPlus.Constants.testnet

const profiler = new StellarPlus.Utils.SorobanProfiler();
const client = new StellarPlus.Asset.SorobanTokenHandler({
  network,
  contractId: "CBK...",
  options: profiler.getOptionsArgs(),
});
```
{% endcode %}

With this configuration, all the transactions invoked by this client will be logged inside the profiler.&#x20;

### Invoking the transactions

Now we can invoke the transaction that will be evaluated, always respecting the business rule of our contract. In our example, we'll call the methods `mint`, `burn` and `transfer`.\
We are omitting the initialization of the accounts and TransactionInvocation used, but they must be done properly.

```typescript
await client.mint({
    amount: BigInt(100),
    to: user1.getPublicKey(),
    ...issuerTxInvocation,
});

await client.burn({
    amount: BigInt(10),
    from: user1.getPublicKey(),
    ...issuerTxInvocation,
});

await client.transfer({
    amount: BigInt(50),
    from: user1.getPublicKey(),
    to: user2.getPublicKey(),
    ...user1TxInvocation,
});
```

### Collecting the results

Once you have executed the transactions, utilize the profiler to see the results. You can choose between displaying the metrics in a text table format or as a CSV.&#x20;

```typescript
// Displaying the results in text table format
const tableResults = profiler.getLog({ formatOutput: "text-table" });
console.log(tableResults)

// Displaying the results in CSV format
const csvResults = profiler.getLog({ formatOutput: "csv" });
console.log(logDataPoolRouter);
```

The profiler also provides the flexibility to apply filters and perform operations on the collected data. Refer to section [Soroban Profiler](../reference/utils/soroban-profiler.md) for more information on using these features.&#x20;

### Using a custom profiler

It is possible to use your own custom profiler to collect transaction metrics. For this, ensure your method follows this interface:

```typescript
function yourCustomProfiler(
  methodName: string,
  costs: TransactionCosts,
  elapsedTime: number,
  feeCharged: number
): void {
  // process the data
}
```

Initialize the client using this profiler and enable debugging:

```typescript
const client = new StellarPlus.Asset.SorobanTokenHandler({
  network,
  contractId: "CBK...",
  options: {
    debug: true, 
    costHandler: yourCustomProfiler
  }
});
```

Your method will be invoked automatically with the transaction metrics as a parameter each time a transaction execution concludes.
