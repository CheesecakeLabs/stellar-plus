# Fee Bump

<figure><img src="../../../.gitbook/assets/image (2).png" alt="" width="563"><figcaption></figcaption></figure>

## Input

```typescript
type FeeBumpPipelineInput = {
  innerTransaction: Transaction
  feeBumpHeader: FeeBumpHeader
}
```

* **innerTransaction**: A stellar transaction object to be wrapped into a fee bump.
* **feeBumpHeader**: A header containing information about the source account, fee, and signers for the fee bump.

## Output

```typescript
type FeeBumpPipelineOutput = FeeBumpTransaction
```

The output provides the wrapped fee bump transaction.
