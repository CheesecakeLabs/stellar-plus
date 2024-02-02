# Sign Transaction

<figure><img src="../../../.gitbook/assets/image (3).png" alt="" width="563"><figcaption></figcaption></figure>

Given a transaction or fee bump transaction, this pipeline will verify the list of provided requirements and sign the envelope accordingly. The 'signers' array is used for the signing process, throwing an error in case a signer is missing for a given requirement.

&#x20;

{% hint style="info" %}
Soroban authorization entries are not handled by this pipeline. A  dedicated Soroban authorization pipeline will released soon.
{% endhint %}

## Input

```typescript
type SignTransactionPipelineInput = {
  transaction: Transaction | FeeBumpTransaction
  signatureRequirements: SignatureRequirement[]
  signers: AccountHandler[]
}
```

* **transaction**: The transaction or fee bump transaction object to be signed.
* **signatureRequirements**: An array of signature requirements to be applied when signing the transaction. Refer to [classic-signing-requirements.md](classic-signing-requirements.md "mention") for details on how to generate the requirements.
* **signers**: Array of `AccountHandlers` for the necessary accounts to sign the transaction.

## Output

```typescript
type SignTransactionPipelineOutput = Transaction | FeeBumpTransaction
```

This pipeline directly outputs the signed transaction or fee bump transaction.
