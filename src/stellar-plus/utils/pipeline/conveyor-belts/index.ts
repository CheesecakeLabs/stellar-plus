import { v4 as uuidv4 } from 'uuid'

import { BeltPluginType, BeltProcessFunction, ConveyorBeltType } from './types'

export class ConveyorBelt<Input, Output, BeltType> implements ConveyorBeltType<Input, Output, BeltType> {
  type: BeltType
  id: string

  private process: BeltProcessFunction<Input, Output>

  private plugins: BeltPluginType<Input, Output, BeltType>[]

  constructor(
    type: BeltType,
    process: BeltProcessFunction<Input, Output>,
    plugins: BeltPluginType<Input, Output, BeltType>[]
  ) {
    this.type = type
    this.id = uuidv4() as string
    this.process = process
    this.plugins = plugins
  }

  public async execute(item: Input, existingItemId?: string): Promise<Output> {
    const itemId = existingItemId || (uuidv4() as string)

    const preProcessedItem = await this.preProcess(item, itemId, this.id)
    const processedItem = (await this.process(preProcessedItem, itemId, this.id)) as Output
    const postProcessedItem = await this.postProcess(processedItem, itemId, this.id)

    return postProcessedItem as Output
  }

  private async preProcess(item: Input, itemId: string, beltId: string): Promise<Input> {
    let preProcessedItem = item as Input

    for (const plugin of this.plugins) {
      preProcessedItem = (await plugin.preProcess(preProcessedItem, itemId, beltId)) as Input
    }

    return preProcessedItem
  }

  private async postProcess(item: Output, itemId: string, beltId: string): Promise<Output> {
    let postProcessedItem = item

    for (const plugin of this.plugins) {
      postProcessedItem = (await plugin.postProcess(postProcessedItem, itemId, beltId)) as Output
    }

    return postProcessedItem
  }
}
