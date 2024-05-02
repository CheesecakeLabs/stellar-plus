# Submit Transaction

<figure><img src="../../../.gitbook/assets/image (6).png" alt="" width="563"><figcaption></figcaption></figure>



## Input

```typescript
 type SubmitTransactionPipelineInput = {
  transaction: Transaction | FeeBumpTransaction
  networkHandler: RpcHandler | HorizonHandler
}
```

* **transaction**: A transaction of fee bump transaction ready to be submitted for processing.
* **networkHandler**: A handler to communicate with the Stellar network. Can be an [RPC handler](../../rpc/) for Soroban transactions or preferably a[ HorizonHandler ](../../horizon-handler.md)for Stellar Classic transactions.

## Output

```typescript
type SubmitTransactionPipelineOutput = {
  response: HorizonApi.SubmitTransactionResponse | SorobanRpc.Api.SendTransactionResponse
}
```

* **response**: A response object for a successful transaction. Can be of type `HorizonApi.SubmitTransactionResponse` for Classic transactions or `SorobanRpc.Api.SendTransactionResponse` for Soroban transactions.  These types are sourced from[ js-stellar-sdk](https://github.com/stellar/js-stellar-sdk).
