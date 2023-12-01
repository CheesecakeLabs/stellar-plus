# Transaction Processor

The `TransactionProcessor` class is designed to encapsulate and control the base pipeline for building and processing classic Stellar transactions. It provides a robust framework for handling various aspects of transaction creation, signing, and submission.

It is inherited by other tools in Stellar Plus to enable the classic transaction processing capabilities and can be used to build your custom functionalities as the underlying engine to manage the core transaction pipeline.

### Constructor

* **Parameters**:
  * `network`: The Stellar network configuration.
  * `transactionSubmitter` (optional): A custom transaction submitter. If not provided, a default submitter is used.

### Key Components

* **Horizon Handler**: Manages interactions with the Stellar Horizon server.
* **Network Configuration**: Holds details about the Stellar network being used.
* **Transaction Submitter**: Handles the submission of transactions to the Stellar network.



### Core Functionalities

#### signEnvelope

* **Purpose**: Signs a transaction envelope with the provided signers.
* **Parameters**:
  * `envelope`: The transaction to be signed.
  * `signers`: An array of `AccountHandler` instances for signing the transaction.
* **Returns**: The signed transaction in XDR format.

#### wrapFeeBump

* **Purpose**: Wraps a transaction with a fee bump.
* **Parameters**:
  * `envelopeXdr`: The XDR of the transaction to be fee-bumped.
  * `feeBump`: The fee bump header details.
* **Returns**: A fee-bumped transaction.

#### processTransaction

* **Purpose**: Processes a transaction by signing it, optionally wrapping it with a fee bump, and submitting it to the network.
* **Parameters**:
  * `envelope`: The transaction to be processed.
  * `signers`: Signers for the transaction.
  * `feeBump` (optional): Fee bump details if applicable.
* **Returns**: The response from the Horizon server after submission.

#### verifySigners

* **Purpose**: Verifies that all required signers are present for a transaction.
* **Parameters**:
  * `publicKeys`: Array of public keys that must be included as signers.
  * `signers`: The actual signers provided for the transaction.

#### buildCustomTransaction

* **Purpose**: Builds a custom Stellar transaction with specific operations.
* **Parameters**:
  * `operations`: An array of operations to include in the transaction.
  * `txInvocation`: Transaction invocation details.
* **Returns**: The built transaction and updated transaction invocation details.

### Conclusion

The `TransactionProcessor` class serves as a foundational component for managing Stellar transactions, streamlining the process of transaction creation, signing, and submission. It provides a versatile and efficient way to handle complex transaction operations, suitable for a wide range of Stellar-based applications.
