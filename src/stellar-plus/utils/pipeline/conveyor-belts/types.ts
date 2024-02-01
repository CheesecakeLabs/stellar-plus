import { StellarPlusError } from 'stellar-plus/error'

export type ConveyorBeltType<Input, Output, BeltType> = {
  type: BeltType
  id: string
  execute: (item: Input) => Promise<Output>
}

export type BeltPluginType<Input, Output, BeltType> = {
  readonly name: string
  readonly type: BeltType

  preProcess?: (item: Input, meta: BeltMetadata) => Promise<Input>
  postProcess?: (item: Output, meta: BeltMetadata) => Promise<Output>
  processError?: (error: StellarPlusError, meta: BeltMetadata) => Promise<StellarPlusError>
}

export type BeltMetadata = {
  itemId: string
  beltId: string
  beltType: string
}

export enum GenericPlugin {
  id = 'GenericPlugin',
}

export type BeltProcessFunction<Input, Output> = (item: Input) => Promise<Output>
