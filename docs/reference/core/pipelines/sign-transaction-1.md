# Soroban Auth

<figure><img src="../../../.gitbook/assets/image (1).png" alt="" width="563"><figcaption></figcaption></figure>

Given a transaction simulation that identified one or many `SorobanAuthorizationEntry` that require individual authorization, this pipeline will go through the entire list, sign each entry, and then finally provide an updated version of the transaction with the authorization.

Refer to the [official Soroban Authorization documentation](https://soroban.stellar.org/docs/soroban-internals/authorization) for further details on the Soroban authentication mechanisms.

{% hint style="info" %}
This pipeline only acts on the individual Soroban authorization entries. Other signatures to authorize the envelope source or classic operations are handled by the [Sign Transaction Pipeline](sign-transaction.md).
{% endhint %}



## Input

```typescript
export type SorobanAuthPipelineInput = {
  transaction: Transaction
  simulation: SorobanRpc.Api.SimulateTransactionSuccessResponse | SorobanRpc.Api.SimulateTransactionRestoreResponse
  signers: AccountHandler[]
  rpcHandler: RpcHandler
}
```

* **transaction**: The transaction being authorized.
* **simulation:** The simulation response received from the [Simulate Transaction pipeline](simulate-transaction.md).
* **signers**: Array of `AccountHandlers` with the necessary accounts to sign the soroban authorization entries.
* **rpcHandler**: An rpcHandler so the pipeline can interact with an RPC server.

## Output

```typescript
export type SorobanAuthPipelineOutput = Transaction
```

This pipeline directly outputs the updated assembled transaction containing the signed authorization entries.



## Workflow

The internal steps performed by this pipeline are executed in the following sequence:

1. Validate if a Soroban authorization is required. In case the provided simulation has no result or auth entry, the pipeline just skips completely.
2. Iterate over the authorization entries provided and check for the necessary credentials for each one.
3. Find the AccountHandler in the signer's list for that entry and sign it.
4. Once all entries are signed, a new transaction is created with the same parameters as the original but also including the auth entries.
5. An internal [Simulate Transaction pipeline](simulate-transaction.md) is executed for the updated transaction.
6. The successful simulation is used to assemble the updated transaction and return it as the output of the pipeline.\


**Important:** During step 3, all signatures include an expiration ledger number that indicates until which ledger this signature is valid. Here, the pipeline automatically defines this value as follows:

1. If the original transaction has a precondition with a maximum ledger for validity, the same ledger is used for the signatures.
2. If the original transaction has a precondition with a maximum time for validity, that period is used to calculate when the transaction will expire and use the approximate same ledger sequence for the signature.
3. In case none of the previous is set, an arbitrary 10-minute interval is used to calculate a target expiration ledger.
