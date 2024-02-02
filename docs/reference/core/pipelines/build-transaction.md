# Build Transaction

<figure><img src="../../../.gitbook/assets/image (2).png" alt="" width="563"><figcaption></figcaption></figure>



### Input

```typescript
type BuildTransactionPipelineInput = {
  header: EnvelopeHeader
  horizonHandler: HorizonHandler
  operations: xdr.Operation[]
  networkPassphrase: string
  sorobanData?: string | xdr.SorobanTransactionData
}
```

* **header**: Base parameters to build the envelope. Contains a source account, fee, and timeout information.
* **horizonHandler**: A handler to fetch data from Stellar through a Horizon instance.
* **operations**:  An array of operations to be included in the transaction.
* **networkPassphrase**: The network passphrase for the target network for this transaction.
* **sorobanData**:  Soroban data to be included in the transaction.&#x20;

**Output:**

```typescript
type BuildTransactionPipelineOutput = Transaction
```

The output directly returns a transaction built with the provided parameters.



