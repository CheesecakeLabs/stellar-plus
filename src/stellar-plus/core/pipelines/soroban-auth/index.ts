import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import {
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelinePlugin,
  SorobanAuthPipelineType,
} from './types'

export class SorobanAuthPipeline extends ConveyorBelt<
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelineType
> {
  constructor(plugins?: SorobanAuthPipelinePlugin[]) {
    super({
      type: SorobanAuthPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(item: SorobanAuthPipelineInput, _itemId: string): Promise<SorobanAuthPipelineOutput> {
    return item.transaction
  }
}
