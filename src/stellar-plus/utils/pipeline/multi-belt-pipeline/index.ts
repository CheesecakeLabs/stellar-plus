import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'
import {
  BeltMainPluginType,
  BeltPlugin,
  MultiBeltPipelineOptions,
} from 'stellar-plus/utils/pipeline/multi-belt-pipeline/types'

import { filterPluginsByTypes } from '../plugins/helpers'

export class MultiBeltPipeline<
  Input,
  Output,
  BeltType extends string,
  SupportedInnerPlugins extends { type: string },
> extends ConveyorBelt<Input, Output, BeltType> {
  protected innerPlugins: SupportedInnerPlugins[]

  constructor(options: MultiBeltPipelineOptions<Input, Output, BeltType, SupportedInnerPlugins>) {
    const mainPlugins = filterPluginsByTypes<
      BeltPlugin<Input, Output, BeltType, SupportedInnerPlugins>,
      BeltType | GenericPlugin
    >(options.plugins || [], [options.beltType as BeltType, GenericPlugin.id]) as
      | BeltMainPluginType<Input, Output, BeltType>[]
      | undefined

    super({
      type: options.beltType,
      plugins: mainPlugins || [],
    })

    const innerPlugins = filterPluginsByTypes<SupportedInnerPlugins, BeltType>(
      options.plugins || [],
      [options.beltType as BeltType],
      true
    ) as SupportedInnerPlugins[]

    this.innerPlugins = innerPlugins || []
  }

  protected getInnerPluginsByType<PluginType, PipelineType>(
    executionPlugins: SupportedInnerPlugins[],
    pipelineType: PipelineType,
    excludeGeneric?: boolean
  ): SupportedInnerPlugins[] {
    const filterTypes = excludeGeneric
      ? [pipelineType as PipelineType]
      : [pipelineType as PipelineType, GenericPlugin.id]
    return filterPluginsByTypes<SupportedInnerPlugins, PluginType>(
      [...(this.innerPlugins as SupportedInnerPlugins[]), ...executionPlugins],
      filterTypes as PluginType[]
    )
  }
}
