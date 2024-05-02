---
description: Initialize, manage and interact with Stellar accounts.
---

# Account

Accounts in Stellar Plus are represented in a few different ways that abstract the complexity of managing Stellar keypairs and signing capabilities, integrating directly with the transaction pipeline in a seamless way.  They can be categorized as the following:



* **Base:** The simplest representation of an account, it is initialized by a 'Public Key' string. Cannot perform any changes or approve transactions.
* **Account Handler:** Management representation of an account, can sign and authorize transactions for a given account. These can be extended to implement custom key management pipelines that integrate directly with the library capabilities.





{% hint style="info" %}
Tip: Depending on the arguments provided when initializing an Account, extra helpers will be made available in the instance of that account. See[Broken link](broken-reference "mention") for further information.
{% endhint %}

&#x20;
