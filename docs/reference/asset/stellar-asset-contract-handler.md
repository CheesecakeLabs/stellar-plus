# Stellar Asset Contract Handler

### Introduction

The `SACHandler` class in the Stellar Plus library is a sophisticated tool designed for managing Stellar Classic assets wrapped in the Stellar Asset Contract (SAC). It seamlessly integrates the functionalities of a classic asset handler (`ClassicAssetHandler`) and a Soroban token handler (`SorobanTokenHandler`), providing a unified interface for both Classic and Soroban asset interactions.

### Core Features

* **Dual Interface**: Combines classic asset functionalities with Soroban token operations.
* **Wrap and Deploy**: Facilitates the wrapping of classic assets into Soroban contracts, enabling deployment and interaction on the Soroban framework.

### Constructor Parameters

The `SACHandler` constructor accepts `SACConstructorArgs`, which include:

* `network`: Network configuration (testnet ).
* Classic Asset Parameters:
  * `code`: Asset code of the classic asset.
  * `issuerPublicKey`: Public key of the issuer of the classic asset.
  * `issuerAccount`: Optional issuer account handler. This will enable management functionalities in the Classic Handler.
  * `transactionSubmitter`: Optional classic transaction submitter.&#x20;
* Soroban Token Parameters:
  * `spec`: Optional contract specification object for the Soroban token.
  * `wasm`: Optional WASM file as a Buffer for the Soroban token.
  * `wasmHash`: Optional identifier for the WASM hash of the Soroban token.
  * `contractId`: Optional identifier of the deployed Soroban contract.
  * `rpcHandler`: Optional custom Soroban RPC handler.

### Initialization

Upon initialization, the `SACHandler` instantiates both the `ClassicAssetHandler` and the `SorobanTokenHandler` with the provided constructor arguments. This dual initialization allows the SACHandler to manage and interact with both classic assets and their corresponding wrapped Soroban token representations.

### Key Methods

#### Wrap and Deploy

* **wrapAndDeploy**: Wraps a classic asset with the Stellar Asset Contract and deploys it for interaction in the Soroban framework.
  * Arguments: `TransactionInvocation`, which includes transaction header, signers, and optional fee bump parameters.
  * Output: `Promise<void>`, indicating the completion of the wrap and deployment process.

After the wrapping takes place, the contract ID will be updated directly in its Soroban Token Handler.
