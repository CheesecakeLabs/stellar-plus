# Auto Restore Plugin

<figure><img src="../../../.gitbook/assets/image (13).png" alt=""><figcaption></figcaption></figure>

The Auto Restore plugin can be used to automatically perform a restore transaction whenever a soroban transaction simulation identifies archived states that would interfere with the transaction execution.

For further details on this scenario, refer to Soroban's official documentation on [State Archival](https://soroban.stellar.org/docs/soroban-internals/state-archival).

* Pipeline Type: [simulate-transaction.md](../../core/pipelines/simulate-transaction.md "mention")
* Supported Pipelines:&#x20;
  * [simulate-transaction.md](../../core/pipelines/simulate-transaction.md "mention")
  * [soroban-transaction.md](../../core/pipelines/soroban-transaction.md "mention") - Targets its inner pipeline.
  * [classic-transaction.md](../../core/pipelines/classic-transaction.md "mention")- Targets its inner pipeline.

## Setup

Constructor arguments:

* **restoreTxInvocation**: An object of a Transaction Invocation to parametrize the restore transaction. If a Fee Bump header is present, the transaction will use the [Fee Bump plugin](fee-bump-plugin.md) to wrap the transaction with this header.
* **networkConfig**: A network configuration. Refer to [constants.md](../../constants.md "mention")
* **customRpcHandler**: An optional custom RPC handler to be used for this transaction.

## postProcess

During the `postProcess` of the Simulate Transaction pipeline, the Auto Restore plugin will verify if the response of the simulation indicates a restore is required. In case yes, it will perform the following steps:



1. Extract the restorePreamble from the simulation
2. Build a restore transaction with its parameters and the restorePreamble
3. Execute the transaction
4. Verify if the original transaction's source was the same as the restore transaction and bumps its sequence number if necessary.

Afterward, the Simulation Pipeline will proceed with the `postProcess` step before exiting.
