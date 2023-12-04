# Contract Engine

The `ContractEngine` class serves as a base for building clients that interact with smart contracts on the Stellar network. It provides essential functionalities to read from and invoke contract methods, handling the intricacies of transaction building, signing, submission, and output processing.

## Constructor

* **Parameters**:
  * `network`: The network configuration for the Stellar blockchain.
  * `rpcHandler`: The RPC handler for interacting with the Stellar network. When not provided, will connect directly to the RPC url set in the network configuration.
  * `spec`: A `ContractSpec` object detailing the contract's specifications.
  * `contractId`: A string representing the unique identifier of the deployed contract.

## Methods

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

## Example Usage

The `CertificateOfDepositClient` class (See [certificate-of-deposit-client.md](certificate-of-deposit-client.md "mention")) is an example of how to extend the `ContractEngine` class to interact with a specific smart contract. This client showcases the implementation of methods that utilize both `readFromContract` and `invokeContract` functionalities provided by `ContractEngine`.

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
