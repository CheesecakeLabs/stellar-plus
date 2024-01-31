# Soroban Transaction

<figure><img src="../../../.gitbook/assets/image (8).png" alt=""><figcaption></figcaption></figure>

The Soroban Transaction pipeline is a multi-belt pipeline that covers the entire lifecycle process of a Soroban Transaction. It implements the following inner pipelines in sequence:

1. Build Transaction
2. Simulate Transaction
3. Soroban Auth\*
4. Classic Signing Requirements
5. Sign Transaction
6. Submit Transaction
7. Soroban Get Transaction

_\*Coming soon._



## Input

```typescript
type SorobanTransactionPipelineInput = {
  txInvocation: TransactionInvocation
  operations: xdr.Operation[]
  options?: {
    executionPlugins?: SupportedInnerPlugins[]
    simulateOnly?: boolean
  }
}
```

* **txInvocation**: A Transaction Invocation object containing the core parameters to build the transaction, such as fee, source account, signers, etc.
* **operations**:  An array of operations(Soroban transactions can only include one) .
* **options**: An optional 'options' object with parameters to customize this transaction's execution. Refer to the 'Options' section down below for further details.



## Options

The options object provided in the input parameter for a Soroban Transaction pipeline execution can be used to customize this execution's behavior accordingly.

* **executionsPlugins**: Accepts an array of plugins supported by the Soroban Transaction pipeline and its inner pipelines to be used in this single transaction execution. This allows for a single-use customization to be used on target transactions and specific scenarios.
* **simulateOnly**: When true, the transaction execution will only be processed until the Simulate Transaction pipeline and returns its output. This is useful when only reading data from a contract without executing any state change or simply to verify if a given transaction would be processed successfully.



## Supported Plugins

As Soroban Transaction is composed of inner pipelines, it supports a more robust plugin integration with three possible ways of customizing the pipeline behavior:

**Soroban Pipeline plugin:**

Provided when instantiating the pipeline, plugins that are of type `SorobanTransactionPipelineType` pipeline or `Generic` can be used to modify the main pipeline during the `preProcess`, `postProcess` or `processError` phases.

**Soroban Pipeline Supported plugins:**

Provided when instantiating the pipeline, plugins that are of the type of one of the inner pipelines will be included in the inner pipeline during execution.

**Execution Plugins:**

Provided in the input options, plugins that are of the type of one of the inner pipelines will be included in the inner pipeline only during this single execution.
