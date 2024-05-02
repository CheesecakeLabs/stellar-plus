---
description: Initiate and manage an account directly through its secret key.
---

# Default Account Handler

Extending the 'AccountHandler', the '**DefaultAccountHandler'** class allows for an account to be loaded through its secret key, enabling its management capabilities. This account can then be used in transaction invocation as a 'signer' parameter to integrate into the transactions pipeline.



### How to use

There are a few different options to initialize an account with the Default account that can be used depending on the use case.



#### Initializing with the secret key

The main way of initializing a default account handler is by providing its secret key to an object during the instantiation of the class as the following:

{% code overflow="wrap" lineNumbers="true" %}
```typescript
const myAccount = new StellarPlus.Account.DefaultAccountHandler({secretKey:"SCGCPZYE24NMPOXAH3E3VZMMN4AIQSCXPN4K6MWZ7FLYVA57H26C5NWY”})
```
{% endcode %}

This is used when you already have an existing account and want to handle it after loading it secret key from a different source.

#### Initializing a new account

Whenever the default account handler is instantiated without providing a secret key, it automatically generates a new random keypair and uses it.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
const myAccount = new StellarPlus.Account.DefaultAccountHandler({})
```
{% endcode %}

When using this option, be aware that the keys are merely generated locally, the account still won't exist in the Stellar network until a 'create account' operation is performed. For this, when using test networks that have a Friendbot, one can make use of the 'Friendbot' helper for Accounts to initialize the account with some lumens funds. Refer to the article [Broken link](broken-reference "mention") for more detail.

