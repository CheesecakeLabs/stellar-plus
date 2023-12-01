# Default Transaction Submitter

The `DefaultTransactionSubmitter` class, implementing the `TransactionSubmitter` interface, is designed to facilitate the submission of transactions to the Stellar network. This class handles the creation of transaction envelopes and the submission process, including handling fee bumping if required.\
\
Crafted as the default implementation used when no custom submitter is provided, it represents the most straightforward approach, effectively meeting the submitter interface requirements.

### Constructor

* **Parameters**:
  * `network`: The Stellar network configuration.
  * `feeBump` (optional): Contains details for fee-bumping transactions. If specified, it checks each transaction invocation to determine if a fee bump is already included. If not, it applies the provided fee bump details.

### Core Functionalities

#### createEnvelope

* **Purpose**: Constructs a transaction envelope based on the given transaction invocation.
* **Parameters**: `txInvocation` (TransactionInvocation).
* **Returns**: An object containing the `TransactionBuilder` envelope and an updated transaction invocation.

#### submit

* **Purpose**: Submits a transaction to the Stellar network.
* **Parameters**: `envelope` (Transaction).
* **Returns**: The transaction response from the Horizon server (`SubmitTransactionResponse`).

#### postProcessTransaction

* **Purpose**: Processes the response after submitting a transaction.
* **Parameters**: `response` (`SubmitTransactionResponse`).
* **Returns**: Processed transaction data or throws an error if the transaction failed.

### Usage and Implementation

The `DefaultTransactionSubmitter` is primarily used within the transaction processing pipeline to handle the critical step of submitting transactions to the Stellar network. It ensures that transactions are properly constructed and submitted, considering any fee bump requirements. Additionally, it offers post-submission processing to interpret the transaction results, making it a vital component in the Stellar transaction lifecycle.
