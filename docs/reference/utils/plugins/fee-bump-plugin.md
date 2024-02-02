# Fee Bump Plugin



<figure><img src="../../../.gitbook/assets/image (11).png" alt=""><figcaption></figcaption></figure>

The Fee Bump plugin can be used to wrap any given transaction into a Fee Bump transaction before moving forward to submit the transaction for processing.



* Pipeline Type: [submit-transaction.md](../../core/pipelines/submit-transaction.md "mention")
* Supported Pipelines:&#x20;
  * [submit-transaction.md](../../core/pipelines/submit-transaction.md "mention")
  * [soroban-transaction.md](../../core/pipelines/soroban-transaction.md "mention") - Targets its inner pipeline.
  * [classic-transaction.md](../../core/pipelines/classic-transaction.md "mention")- Targets its inner pipeline.

## preProcess

During the `preProcess` step of [submit-transaction.md](../../core/pipelines/submit-transaction.md "mention") pipelines, the Fee Bump plugin takes the original transaction and executes internal pipelines for it using the original header provided when instantiating the plugin according to the following steps.

1. Wrap transaction into Fee Bump
2. Calculate the signing requirements
3. Sign the fee bump transaction
4. Substitute the transaction object with the fee bump transaction object

Once the transaction is successfully wrapped into a fee bump and signed, the `preProcess` step proceeds with the Fee Bump transaction instead of the original transaction.
