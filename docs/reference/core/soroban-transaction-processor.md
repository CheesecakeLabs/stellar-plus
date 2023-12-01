# Soroban Transaction Processor

The `SorobanTransactionProcessor` extends the `TransactionProcessor` class to incorporate the Soroban pipeline, focusing on building and processing transactions specifically for smart contracts on the Stellar network. This class handles the complexities of interacting with the Soroban environment, offering a streamlined approach to transaction handling.

### Constructor

* **Parameters**:
  * `network`: The Stellar network configuration.
  * `rpcHandler` (optional): The RPC handler for Soroban transactions. If not provided, the default handler is used.

### Core Functionalities

#### buildTransaction

* **Purpose**: Constructs a Soroban transaction based on smart contract invocation parameters.
* **Parameters**:
  * `args`(SorobanSimulateArgs): Includes the method, arguments, and header for the transaction.
  * `spec`: Contract specification.
  * `contractId`: The identifier of the contract.
* **Returns**: A prepared `SorobanTransaction`.

#### simulateTransaction

* **Purpose**: Simulates the execution of a transaction in the Soroban environment.
* **Parameters**:
  * `tx`: The `SorobanTransaction` to be simulated.
* **Returns**: Simulation response, indicating the predicted outcome.

#### prepareTransaction

* **Purpose**: Prepares a Soroban transaction for submission. This step generally performs a `simulateTransaction`, followed by verifying the result, and, assembling the transaction for submission.
* **Parameters**:
  * `tx`: The `SorobanTransaction` to be prepared.
* **Returns**: A prepared `SorobanTransaction`.

#### submitSorobanTransaction

* **Purpose**: Submits either a standard or fee-bumped Soroban transaction to the network.
* **Parameters**:
  * `tx`: A `SorobanTransaction` or `SorobanFeeBumpTransaction`.
* **Returns**: Submission response from the Soroban RPC server.

#### processSorobanTransaction

* **Purpose**: Processes a Soroban transaction, including signing, optional fee bumping, and submission. It bundles up the final steps once a transaction has been returned from `prepareTransaction` and handles the submission and post-processing of the transaction.
* **Parameters**:
  * `envelope`: The transaction envelope.
  * `signers`: Signers of the transaction.
  * `feeBump` (optional): Details for fee bumping.
* **Returns**: The response after processing the transaction.

#### postProcessSorobanSubmission

* **Purpose**: Handles the response to a Soroban transaction submission, including waiting for completion.
* **Parameters**:
  * `response`: The initial response from the Soroban RPC server.
* **Returns**: The final transaction status after processing.

#### waitForSorobanTransaction

* **Purpose**: Implements a wait mechanism for a transaction's status using exponential backoff.
* **Parameters**:
  * `transactionHash`: The hash of the transaction.
  * `secondsToWait`: Maximum wait time in seconds.
* **Returns**: The final status of the transaction.

#### wrapSorobanFeeBump

* **Purpose**: Wraps a Soroban transaction with a fee bump.
* **Parameters**:
  * `envelopeXdr`: The XDR of the transaction to be fee-bumped.
  * `feeBump`: The fee bump header details.
* **Returns**: A `FeeBumpTransaction`.

### Conclusion

The `SorobanTransactionProcessor` class facilitates the handling of smart contract transactions in the Soroban environment, simplifying the complexities of transaction construction, simulation, and submission. This class is vital for developers working with Soroban smart contracts on the Stellar network, providing an efficient and structured approach to transaction processing.
