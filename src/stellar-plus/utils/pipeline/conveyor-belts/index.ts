import { v4 as uuidv4 } from 'uuid'

import { BeltMetadata, BeltPluginType, ConveyorBeltType } from './types'

export class ConveyorBelt<Input, Output, BeltType> implements ConveyorBeltType<Input, Output, BeltType> {
  type: BeltType
  id: string

  private plugins: BeltPluginType<Input, Output, BeltType>[]

  constructor(type: BeltType, plugins: BeltPluginType<Input, Output, BeltType>[]) {
    this.type = type
    this.id = uuidv4() as string
    this.plugins = plugins
  }

  protected async process(_item: Input, _meta: BeltMetadata): Promise<Output> {
    throw new Error('ConveyorBelt process function not implemented')
  }

  public async execute(item: Input, existingItemId?: string): Promise<Output> {
    const itemId = existingItemId || (uuidv4() as string)

    const preProcessedItem = await this.preProcess(item, this.getMetadata(itemId))
    const processedItem = (await this.process(preProcessedItem, this.getMetadata(itemId))) as Output
    const postProcessedItem = await this.postProcess(processedItem, this.getMetadata(itemId))

    return postProcessedItem as Output
  }

  private async preProcess(item: Input, meta: BeltMetadata): Promise<Input> {
    let preProcessedItem = item as Input

    for (const plugin of this.plugins) {
      if (plugin.preProcess) {
        preProcessedItem = (await plugin.preProcess(preProcessedItem, meta)) as Input
      }
    }

    return preProcessedItem
  }

  private async postProcess(item: Output, meta: BeltMetadata): Promise<Output> {
    let postProcessedItem = item

    for (const plugin of this.plugins) {
      if (plugin.postProcess) {
        postProcessedItem = (await plugin.postProcess(postProcessedItem, meta)) as Output
      }
    }

    return postProcessedItem
  }

  private getMetadata(itemId: string): BeltMetadata {
    return {
      itemId,
      beltId: this.id,
    }
  }
}
