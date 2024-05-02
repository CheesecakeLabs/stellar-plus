# Soroban Token Handler

### Introduction

The `SorobanTokenHandler` is a key component of the Stellar Plus library, designed specifically for managing and interacting with Soroban Token contracts on the Stellar network. As an extension of the `ContractEngine`, it provides a tailored interface for handling a variety of operations associated with Soroban Tokens.

### Core Features

* **Upload WASM**: Facilitates the uploading of contract WASM files to the network.
* **Deploy Contract**: Allows for the deployment of new Soroban Token contracts.
* **Initialize Contract**: Provides the ability to initialize a contract with specific parameters such as admin, decimals, and token name.
* **Read From Contract (Simulations)**: Supports the simulation of contract method calls without altering the contract's state.
* **Invoke Contract (Executions)**: Enables the execution of contract methods that alter the contract's state.

### Constructor Parameters

The `SorobanTokenHandler` constructor accepts the following parameters:

```typescript
export type SorobanTokenHandlerConstructorArgs = {
    networkConfig: NetworkConfig;
    contractParameters?: {
        spec?: ContractSpec;
        contractId?: string;
        wasm?: Buffer;
        wasmHash?: string;
    };
    options?: {
        sorobanTransactionPipeline?:{
            plugins?: SorobanTransactionPipelinePlugin[];
            customRpcHandler?: RpcHandler;
        }
    };
};
```

* `networkConfig`: The Stellar network configuration (testnet or public).
* `contractParameters`:  Optional core parameters used by the Contract Engine to interact with this contract.
  * `spec`: Optional contract specification object. The class already contains a default contract specification which is used by default, so only provide a spec when necessary to use your own custom specification.
  * `contractId`: Optional identifier of the deployed contract.
  * `wasm`: Optional Buffer of the loaded WASM file with compiled contract code.
  * `wasmHash`: Optional hash of the deployed WASM code.
* `Options`: Options that the underlying Contract Engine and its internal mechanisms accept to personalize its behavior
  * `sorobanTransactionPipeline`: Parameters that can be provided to the [internal soroban transaction pipeline](../core/pipelines/soroban-transaction.md).
    * `plugins`: Array of middleware plugins supported by the Soroban Transaction pipeline that can personalize soroban transactions processing.
    * `customRrpcHandler`: Optional [RPC handler ](../rpc/)for interacting with the Stellar network.



{% hint style="info" %}
This class can be initialized in different forms. In case you have an instance of soroban token already live, you can simply provide the Contract ID and proceed with the contract invocations.\
\
Refer to [#contract-initialization-with-contract-engine](../core/contract-engine.md#contract-initialization-with-contract-engine "mention") for more details.
{% endhint %}

### Methods

#### Administrative Methods

* **initialize**: Initializes the contract instance.
  * Arguments: admin (string), decimal (u32), name (string), symbol (string), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **setAdmin**: Sets a new admin for the contract.
  * Arguments: id (string), new\_admin (string), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **admin**: Retrieves the admin account's public key.
  * Arguments: Transaction invocation parameters.
  * Output: Promise\<string>.

#### Token Operations

* **mint**: Mints tokens to a specified account.
  * Arguments: to (string), amount (i128), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **clawback**: Withdraws tokens from an account.
  * Arguments: from (string), amount (i128), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **allowance**: Checks the allowance of a spender by an account.
  * Arguments: from (string), spender (string), and other simulation invocation parameters.
  * Output: Promise\<i128>.

#### User Methods

* **approve**: Approves a spender to spend a specified amount on behalf of an account.
  * Arguments: from (string), spender (string), amount (i128), live\_until\_ledger (u32), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **balance**: Retrieves the balance of an account.
  * Arguments: id (string) and other simulation invocation parameters.
  * Output: Promise\<i128>.
* **transfer**: Transfers tokens from one account to another.
  * Arguments: from (string), to (string), amount (i128), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **transferFrom**: Executes a transfer on behalf of a spender.
  * Arguments: spender (string), from (string), to (string), amount (i128), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **burn**: Burns a specified amount of tokens from an account.
  * Arguments: from (string), amount (i128), and other transaction invocation parameters.
  * Output: Promise\<void>.
* **decimals**: Retrieves the number of decimals for the token.
  * Arguments: Simulation invocation parameters.
  * Output: Promise\<u32>.
* **name**: Retrieves the token's name.
  * Arguments: Simulation invocation parameters.
  * Output: Promise\<string>.
* **symbol**: Retrieves the token's symbol.
  * Arguments: Simulation invocation parameters.
  * Output: Promise\<string>.

This documentation provides a concise technical overview of the `SorobanTokenHandler`, outlining its purpose, core features, constructor parameters, and a comprehensive list of its methods with their respective arguments and outputs.
