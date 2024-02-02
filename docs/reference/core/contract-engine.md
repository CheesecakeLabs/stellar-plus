# Contract Engine

The `ContractEngine` class serves as a base for building clients that interact with smart contracts on the Stellar network. It provides essential functionalities to read from and invoke contract methods, handling the intricacies of transaction building, signing, submission, and output processing.

## Constructor

* **Parameters**:
  * `network`: The network configuration for the Stellar blockchain.
  * `rpcHandler`: Optional. Interacts with the Stellar network; defaults to RPC URL in network config.
  * `spec`: ContractSpec detailing contract specifications.
  * `contractId`: Optional. Unique identifier of the deployed contract.
  * `wasm`: Optional. Buffer of the loaded wasm file with compiled contract code.
  * `wasmHash`: Optional. Hash of the deployed wasm code.
  * `options`: Optional. Additional parameters to tweak specific behavior.



## Core Methods

### readFromContract

* **Purpose**: To fetch data and state from the contract without altering its state. his method simulates a transaction with the RPC server to extract the output of the simulated invocation. It is crucial for operations that require data from the contract without needing a state change.
* **Parameters**: `SorobanSimulateArgs`, which includes:
  * `method`: Contract method to be called.
  * `methodArgs`: Arguments for the method call.
  * `header`: Transaction header details.
* **Returns**: The output of the simulated contract invocation.



### invokeContract

* **Purpose**: To execute invocations that change the state of the contract. This method builds, signs, and submits a transaction to the network. It then extracts the output of the invocation from the processed transaction. This method is vital for operations that modify the contract's state.
* **Parameters**: `SorobanInvokeArgs`, extending `SorobanSimulateArgs` with:
  * `signers`: Array of `AccountHandler` objects for authorizing the transaction.
  * `feeBump`: Optional `FeeBumpHeader` for fee bumping.
* **Returns**: The output of the contract invocation after the transaction is processed.



## Contract Initialization with Contract Engine

You can initialize a contract engine or child client contract in different ways. Since the contract id, wasm and wasm hash are all optional, choose whichever initialization is best for your use case.\
\
When executing the methods, a validation will take place to throw an error in case a requirement is not met.\
\
E.g. Attempting to deploy a contract instance without having a wasmHash. It would've been necessary to either initiate the instance with this argument or, to have performed a `uploadWasm` so that the wasm hash would've been updated in the instance.

This is the full sequence of initialization. You can start at any point depending on your contract's state:

1. Initialize the ContractEngine by loading the WASM file into a Buffer and providing it as the `wasm` parameter.
2. Execute the `uploadWasm` function so the contract code is uploaded to the blockchain. This will generate a WASM Hash and automatically store it in the instance of the ContractEngine
3. Initialize the ContractEngine by providing a `wasmHash` or come from the previous steps.
4. Execute the `deploy` function so a new instance of the contract is deployed on-chain. This will generate a unique contract id and automatically store it in the instance of the ContractEngine.
5. Initialize the ContractEngine by providing a `contractId` or come from the previous steps.
6. If your contract needs to be initialized with an initial state, then invoke its `initialize` function with its arguments so this instance of the contract gets its initial state.&#x20;

After these steps, you should be able to fully utilize your contract.

## **Meta Management Methods**

These methods in the ContractEngine facilitate the necessary steps for contract preparation and deployment, ensuring efficient and accurate interaction with the Soroban network.

#### **uploadWasm**

* **Purpose**: To upload the contract wasm to the network and update the wasm hash in the contract engine.
* **Parameters**:
  * `wasm`: The wasm file buffer.
  * `header`: The header for the transaction.
  * `signers`: The signers for the transaction.
  * `feeBump`: Optional fee bump header.
* **Returns**: No direct return. Updates wasm hash in the engine.
* **Usage**: Used for uploading wasm files to the Soroban server, necessary for contract deployment.

#### **deploy**

* **Purpose**: Deploys a new contract instance to the network and updates the contract ID in the engine.
* **Parameters**:
  * `wasmHash`: The wasm hash of the contract to be deployed.
  * `header`: The header for the transaction.
  * `signers`: The signers for the transaction.
  * `feeBump`: Optional fee bump header.
* **Returns**: No direct return. Updates contract ID in the engine.
* **Usage**: Critical for deploying contracts to the Soroban network, enabling interactions with the contract instance.



## Options

The `ContractEngine` class in Stellar Plus provides a set of configurable options that allow developers to customize its behavior according to specific requirements. These options enhance the flexibility and debugging capabilities of contract interactions. The `options` parameter in the `ContractEngine` constructor supports the following properties:

1. **Debug (boolean)**:
   * **Default**: `false`
   * **Purpose**: Toggles debugging mode. When `true`, it provides detailed information on transaction costs and method execution time. If no `CostHandler` function is provided, these resource consumption details will be logged directly to the console.\

2.  **CostHandler (function)**:

    * **Default**: `defaultCostHandler`
    * **Purpose**: A callback function for handling transaction cost details and execution time. Receives `methodName`, `costs`, and `elapsedTime`. When this function is provided, the transaction cost data will be passed through this function instead of being logged directly to the console.
    * **Integration**: Can be combined with the `Profiler` class from Stellar Plus for in-depth analysis (see the dedicated section on the [soroban-profiler.md](../utils/soroban-profiler.md "mention") class).

    ####

**Example**

{% code lineNumbers="true" %}
```typescript
const contractEngine = new ContractEngine({
  network: myNetworkConfig,
  spec: myContractSpec,
  options: {
    debug: true,
    costHandler: (methodName, costs, elapsedTime) => {
      // Custom logic for handling costs and metrics
    },
  },
});
```
{% endcode %}

This configuration enables debugging and allows for custom handling of performance metrics, aiding in the development and optimization of contract interactions.

## Example Usage

The `CertificateOfDepositClient` class (See [certificate-of-deposit-client.md](../contracts/certificate-of-deposit-client.md "mention")) is an example of how to extend the `ContractEngine` class to interact with a specific smart contract. This client showcases the implementation of methods that utilize both `readFromContract` and `invokeContract` functionalities provided by `ContractEngine`.

### State-Changing Operation: `deposit`

The `deposit` method is an example of a state-changing operation. It uses the `invokeContract` method from `ContractEngine` to alter the state of the contract, in this case, by depositing assets. This method builds and submits a transaction, then waits for it to be processed on the network.

```typescript
public async deposit(args: DepositArgs): Promise<void> {
  const amount = args.amount as i128;
  const address = new Address(args.address);

  await this.invokeContract({
    method: this.methods.deposit,
    methodArgs: { amount, address },
    signers: args.signers,
    header: args.header,
    feeBump: args.feeBump,
  });
}

```

### State-Reading Operation: `getEstimatedYield`

Conversely, `getEstimatedYield` is a state-reading operation. It leverages `readFromContract` to fetch data from the contract without changing its state. This method is crucial for operations that require information from the contract, like calculating the estimated yield for an account, without the need for a transaction to be submitted and processed.

```typescript
public async getEstimatedYield(args: GetEstimatedYieldArgs): Promise<number> {
  const address = new Address(args.address);

  const result: i128 = await this.readFromContract({
    method: this.methods.getEstimatedYield,
    methodArgs: { address },
    header: args.header,
  });

  return Number(result);
}
```

These examples illustrate how `ContractEngine` provides a structured approach to interacting with smart contracts, catering to both reading and writing operations. This dual capability is essential for building robust and versatile Stellar-based applications.

### Conclusion

`ContractEngine` is a foundational class for developing clients that interact with smart contracts on the Stellar network. It abstracts away the complexities of transaction processing and response handling, enabling developers to focus on the specific logic and requirements of their smart contracts.
