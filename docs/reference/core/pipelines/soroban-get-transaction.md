# Soroban Get Transaction

<figure><img src="../../../.gitbook/assets/image (5).png" alt="" width="563"><figcaption></figcaption></figure>

This pipeline covers a portion of the Soroban transaction lifetime right after its submission to be processed by the network. Given a transaction that is still in the status `NOT_FOUND` this pipeline will periodically check upon the transaction hash with the RPC server until the status is changed or a timeout is reached.

By default, the timeout period is set when instantiating this pipeline class. In case an optional transaction object is provided with the input, this transaction will be verified and the pipeline timeout will use the transaction timeout(when set) for that execution.

## Input

```typescript
type SorobanGetTransactionPipelineInput = {
  sorobanSubmission: SorobanRpc.Api.SendTransactionResponse
  rpcHandler: RpcHandler
  transactionEnvelope?: Transaction | FeeBumpTransaction
}
```

* **sorobanSubmission**: The successful response provided after submitting a soroban transaction. Refer to the Submit Transaction pipeline for further details.
* **rpcHandler**: The RPC handler to be used when communicating with the RPC. Refer to the [rpc](../../rpc/ "mention")section for further details.
* **transactionEnvelope**: Optional transaction object to serve as a reference within the pipeline.

## Output

```typescript
type SorobanGetTransactionPipelineOutput = {
  response: SorobanRpc.Api.GetSuccessfulTransactionResponse
  output?: ContractIdOutput & ContractWasmHashOutput & ContractInvocationOutput<string> & FeeChargedOutput
}
```

* **response**: A successful response confirming that the transaction was successfully processed.
* **output**: Optional output inserted by plugins.
