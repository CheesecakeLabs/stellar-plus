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
