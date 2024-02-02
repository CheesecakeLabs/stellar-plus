# Conveyor Belt

<figure><img src="../../../.gitbook/assets/image (14).png" alt=""><figcaption></figcaption></figure>



The util class Conveyor Belt is used to implement the underlying design pattern that composes all the pipelines implemented in Stellar Plus' core. It aims to encapsulate core processes into specific contexts while keeping a great deal of flexibility and personalization.

Each conveyor belt represents a process that is implemented into its internal method 'process'. Using Typescript's generics, one can constrict the belt into only handling a specific Input and Output, also associating its pipeline type.

```typescript
export type ConveyorBeltType<Input, Output, BeltType> = {
  type: BeltType
  id: string
  execute: (item: Input) => Promise<Output>
}
```



## Setup

When initialized, Conveyor belts and their sub-classes can, along with their custom arguments, provide an array of plugins that are compatible with this belt type. These plugins are core to personalizing the workflow of a pipeline by acting at predefined moments of the execution. &#x20;

```typescript
protected plugins: BeltPluginType<Input, Output, BeltType | GenericPlugin>[] 
```

## Execution

The `execute` method serves as the heart of the `ConveyorBelt` class, orchestrating the entire processing pipeline from pre-processing to post-processing, including error management. This method demonstrates the class's ability to transform an input item into an output item, leveraging the flexibility and customizability provided by the plugins. Here's an in-depth look at each step of the execution process:

**1. Invocation**

The execution process begins when the `execute` method is called with an `item` of the specified input type. An optional `existingItemId` can also be passed to identify the item throughout the process, especially useful for tracking and logging purposes as well as leveraging the plugins' capabilities to act on an item through different pipelines.

**2. Pre-Processing**

Before the main processing phase, the item undergoes pre-processing. This step allows for initial modifications or setup actions to be performed on the input. Each plugin with a `preProcess` method will be applied in sequence to the item. The `preProcess` functions are called with the item and metadata (including `itemId`, `beltId`, and `beltType`) allowing plugins to perform context-aware operations.

**3. Main Processing**

After pre-processing, the item is passed to the main `process` method. This method is intended to be overridden in subclasses to implement the core transformation or action of the conveyor belt. The `process` method is where the input item is transformed into the output item.

**4. Error Handling**

If an error occurs during the main processing phase, the error is caught and passed to the `processError` method. This method allows for standardized error handling and potentially converting errors into a manageable format. Plugins with a `processError` method will be invoked in sequence, providing an opportunity to log errors, retry operations, or modify the error before it is re-thrown.

**5. Post-Processing**

Following successful processing (or error handling if an error occurs), the item is subjected to post-processing. Similar to pre-processing, this step involves invoking the `postProcess` method of each plugin, allowing for final adjustments or clean-up operations on the processed item or the handling of any residual effects from the main processing or error-handling phases.

**6. Completion**

Once the post-processing is complete, the final processed item is returned. If an error is caught and not resolved, the modified error is thrown, allowing the caller to handle it as needed.

#### Plugins Integration

The `ConveyorBelt` utilizes plugins to provide extensibility and customization at various stages of the execution process. Plugins can define `preProcess`, `processError`, and `postProcess` methods to interact with the item at different phases. This design allows for a highly modular and flexible system where specific behaviors can be injected or modified without altering the core processing logic.

## Error Management

The error-handling mechanism is designed to ensure robust processing pipelines. By encapsulating error handling within the execution flow, `ConveyorBelt` offers a systematic approach to managing exceptions, allowing for error logging, transformation, or recovery strategies to be implemented seamlessly within the pipeline.



