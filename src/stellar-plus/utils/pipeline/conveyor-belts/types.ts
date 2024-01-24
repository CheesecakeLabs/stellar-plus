export type ConveyorBeltType<Input, Output, BeltType> = {
  type: BeltType
  id: string
  execute: (item: Input) => Promise<Output>
}

export type BeltPluginType<Input, Output, BeltType> = {
  type: BeltType | GenericPlugin

  preProcess?: (item: Input, meta: BeltMetadata) => Promise<Input>
  postProcess?: (item: Output, meta: BeltMetadata) => Promise<Output>
}
export type BeltMetadata = {
  itemId: string
  beltId: string
}

export type GenericPlugin = 'GenericPlugin'

export type BeltProcessFunction<Input, Output> = (item: Input, itemId: string, beltId: string) => Promise<Output>
