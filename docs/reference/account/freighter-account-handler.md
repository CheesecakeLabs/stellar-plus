---
description: Initiate and manage an account directly through its secret key.
---

# Freighter Account Handler

Extending the 'AccountHandler', the '**FreighterAccountHandler'** class allows for an account to be loaded and managed through direct integration with a [Freighter wallet](https://www.freighter.app/).  This account can then be used in transaction invocation as a 'signer' parameter to integrate into the transactions pipeline, triggering the Freighter application automatically when a signature is necessary.

{% hint style="info" %}
**Important:** Freighter is a browser extension, therefore this integration can only be used for web applications.
{% endhint %}

### How to use

The way of initializing a Freighter account handler is by providing a 'network' object during the instantiation of the class as the following:

{% code overflow="wrap" lineNumbers="true" %}
```typescript
const selectedNetwork = StellarPlus.Constants.testnet
const myAccount = new StellarPlus.Account.FreighterAccHandler({network:selectedNetwork})
```
{% endcode %}

The network is used to connect and lock this instance to a specific target network and avoid accidentally triggering signatures to the wrong one.

#### Connecting

Once the object is installed, it'll provide several functions to verify and connect to the Freighter account in the browser. One can use the individual functions to verify the extension state or simply use the method `Connect()` that already performs all necessary validations and triggers the connection.

{% code overflow="wrap" lineNumbers="true" %}
```typescript
await myAccount.connect()
console.log(myAccount.publicKey)
```
{% endcode %}



### Public Methods

#### getPublicKey

* **Returns**: `string` - The public key associated with the connected Freighter account.
* **Description**:
  * Retrieves the public key. If the public key is not already set, it triggers a connection to Freighter.

#### connect

* **Parameters**:
  * `onPublicKeyReceived?: FreighterCallback` - Optional callback function to execute after receiving the public key.
* **Returns**: `Promise<void>`
* **Description**:
  * Initiates a connection to Freighter and retrieves the public key, executing the provided callback upon success. The public key is also updated in the instance of the class to be used in the future.

#### disconnect

* **Returns**: `void`
* **Description**:
  * Disconnects from Freighter by resetting the public key to an empty string.

#### loadPublicKey

* **Parameters**:
  * `onPublicKeyReceived?: FreighterCallback` - Optional callback function to execute after receiving the public key.
  * `enforceConnection?: boolean` - Flag to enforce connection verification and initiation.
* **Returns**: `Promise<void>`
* **Description**:
  * Obtains the public key from Freighter, optionally enforcing connection if not already established, and executes the callback with the public key.

#### sign

* **Parameters**:
  * `tx: Transaction` - The transaction to be signed.
* **Returns**: `Promise<string>` - The signed transaction in XDR format.
* **Description**:
  * Signs a given transaction using Freighter, ensuring that the Freighter is connected and authorized. Throws an error if unable to sign.

#### isFreighterConnected

* **Parameters**:
  * `enforceConnection?: boolean` - Flag to enforce connection if not already established.
  * `callback?: FreighterCallback` - Optional callback to execute after successful connection.
* **Returns**: `Promise<boolean>` - Indicates whether the Freighter connection is established.
* **Description**:
  * Verifies if Freighter is connected and authorized for the current application and network, optionally enforcing connection and executing a callback upon success.

#### isFreighterInstalled

* **Returns**: `Promise<boolean>` - Indicates whether the Freighter extension is installed.
* **Description**:
  * Checks if the Freighter browser extension is installed.

#### isApplicationAuthorized

* **Returns**: `Promise<boolean>` - Indicates whether the application is authorized to connect to Freighter.
* **Description**:
  * Verifies if the current application is authorized to access the Freighter account.

#### isNetworkCorrect

* **Returns**: `Promise<boolean>` - Indicates whether the network selected in Freighter matches the one in the handler.
* **Description**:
  * Validates if the network passphrase in Freighter matches the one expected by the handler, ensuring network alignment.

\
