# Helpers

Whenever initializing accounts, one will have the option of adding optional arguments that can trigger additional helpers to be added to the account's instance. These helpers extend the capabilities of the account instance with utility functions that can be o assistance to many different use cases.



E.g.  Initiating an account as a [default-account-handler.md](../default-account-handler.md "mention")and adding a network to use friendbot and creating the account on-chain.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
// Select a test network that has a Friendbot Url configured
const selectedNetwork = StellarPlus.Constants.testnet

// Instantiate the account with the extra network argument
const myAccount = new StellarPlus.Account.DefaultAccountHandler({secretKey:"SCGCPZYE24NMPOXAH3E3VZMMN4AIQSCXPN4K6MWZ7FLYVA57H26C5NWY”, network:selectedNetwork})

// Triggering Friendbot to create the account on chain an fund it.
myAccount.Friendbot.initialize()
```
{% endcode %}



### Account Helpers List

{% content-ref url="friendbot.md" %}
[friendbot.md](friendbot.md)
{% endcontent-ref %}
