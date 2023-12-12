# Base

The simplest representation of an account, it's initialized by a 'Public Key' string. Cannot perform any changes or approve transactions.



### How to use

'Base' accounts can be initialized by simply generating a new instance and passing a `publicKey` within an object as the main argument.

{% code overflow="wrap" lineNumbers="true" fullWidth="false" %}
```typescript
const myAccount = new StellarPlus.Account.Base({publicKey: "GB4ILVTI56I4XFHCJENY4JO4V7XHFEZCF63SEPIA3MIIQQRMNHQ7TQNQ"})
```
{% endcode %}



