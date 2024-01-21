export type ConveyorBeltType<Input, Output, BeltType> = {
  type: BeltType
  id: string
  execute: (item: Input) => Promise<Output>
}

export type BeltPluginType<Input, Output, PluginType> = {
  type: PluginType

  preProcess: (item: Input, itemId: string, beltId: string) => Promise<Input>
  postProcess: (item: Output, itemId: string, beltId: string) => Promise<Output>
}

export type GenericPlugin = 'GenericPlugin'
