import { BeltPluginType, GenericPlugin } from '../conveyor-belts/types'

export type MultiBeltPipelineOptions<Input, Output, BeltType extends string, SupportedInnerPlugins> = {
  plugins?: BeltPlugin<Input, Output, BeltType, SupportedInnerPlugins>[]
  beltType: BeltType
}

export type BeltMainPluginType<Input, Output, BeltType extends string> = BeltPluginType<
  Input,
  Output,
  BeltType | GenericPlugin
>

export type BeltPlugin<Input, Output, BeltType extends string, SupportedInnerPlugins> = BeltMainPluginType<
  Input,
  Output,
  BeltType
> &
  SupportedInnerPlugins
