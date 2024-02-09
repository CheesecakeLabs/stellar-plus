---
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Classic Signing Requirements

<figure><img src="../../../.gitbook/assets/image (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

This pipeline is responsible for analyzing a provided transaction to identify which signing thresholds need to be met for each account involved in the envelope according to a Stellar Classic transaction. The process will not analyze Soroban operations therefore it covers the following:

* Requirements to authorize the use of the envelope source account.
* Requirements for each classic operation contained in the envelope.

The output will bundle all the requirements in an array of `SignatureRequirement`.

For further details on Stellar signatures, refer to the [Signatures and Multisig official documentation](https://developers.stellar.org/docs/encyclopedia/signatures-multisig).



{% hint style="info" %}
Multisignature is currently not supported and should be added soon.
{% endhint %}

## Input

```typescript
type ClassicSignRequirementsPipelineInput = Transaction | FeeBumpTransaction
```

The Classic Signing Requirements pipeline accepts either a `Transaction` or `FeeBumpTransaction` object. When provided a Fee Bump object, it will only analyze the requirements of the outer envelope.

## **Output:**

```typescript
type ClassicSignRequirementsPipelineOutput = SignatureRequirement[]
```

The output directly returns an array of `SignatureRequirement` objects containing the necessary signatures to validate the transaction according to Stellar classic.



## SignatureRequirement

An object of type `SignatureRequirement` contains a public key and threshold level(low, medium or high) that indicates the required target threshold to authorize a transaction on behalf of that account.

```typescript
type SignatureRequirement = {
  publicKey: string
  thresholdLevel: SignatureThreshold
}

enum SignatureThreshold {
  low = 1,
  medium = 2,
  high = 3,
}
```
