export type ConveyorBeltType<Input, Output, BeltType> = {
  type: BeltType
  id: string
  execute: (item: Input) => Promise<Output>
}

export type BeltPluginType<Input, Output, BeltType> = {
  type: BeltType | GenericPlugin

  preProcess: (item: Input, itemId: string, beltId: string) => Promise<Input>
  postProcess: (item: Output, itemId: string, beltId: string) => Promise<Output>
}

export type GenericPlugin = 'GenericPlugin'

export type BeltProcessFunction<Input, Output> = (item: Input, itemId: string, beltId: string) => Promise<Output>
