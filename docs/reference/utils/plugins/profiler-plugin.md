# Profiler Plugin

<figure><img src="../../../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

The Profiler plugin can be used to collect data about the Soroban transactions execution, providing valuable insights about the contract application performance and resource consumption. At each execution, the profiler plugin will automatically collect and store data in an internal dataset that can later be queried and/or exported to different formats for logging and output to a file.

Refer to the tutorial [e2e-certificate-of-deposit-demo-2.md](../../../tutorials/e2e-certificate-of-deposit-demo-2.md "mention")for further details on how to use it.

* Pipeline Type: [soroban-transaction.md](../../core/pipelines/soroban-transaction.md "mention")



## preProcess

During the `preProcess` step of the Soroban Transaction pipeline, the Profiler plugin will begin its processing for the current item following the steps below:



1. Start a timer for the current item
2. Generate an empty entry in the data log for the current item
3. Inject data extraction plugins for this item's execution
   1. `ExtractTransactionResourcesPlugin`: Acts at the `postProcess` of the Simulate Transaction inner pipeline, extracting the data about resource consumption and updating the profiler data.
   2. `ExtractFeeChargedPlugin`: Acts at the `postProcess` of the Soroban Get Transaction inner pipeline, extracting the data about the fee charged for the transaction processing and updating the profiler data.

## postProcess

During the `postProcess` step of the Soroban Transaction pipeline, the Profiler plugin stops this item's timer and finalizes the entry in the data log as a successful execution.



## processError

Similarly to the `postProcess` step, during the `processError` step of the Soroban Transaction pipeline, the Profiler plugin also stops this item's timer but in this scenario, it finalizes the entry in the data log as a failed execution since it didn't go through the whole pipeline and wasn't fully processed.
