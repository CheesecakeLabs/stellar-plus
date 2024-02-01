import { v4 as uuidv4 } from 'uuid'

import { StellarPlusError } from 'stellar-plus/error'

import { BeltMetadata, BeltPluginType, ConveyorBeltType, GenericPlugin } from './types'

export class ConveyorBelt<Input, Output, BeltType> implements ConveyorBeltType<Input, Output, BeltType> {
  readonly type: BeltType
  readonly id: string

  protected plugins: BeltPluginType<Input, Output, BeltType | GenericPlugin>[]

  constructor(args: { type: BeltType; plugins: BeltPluginType<Input, Output, BeltType | GenericPlugin>[] }) {
    this.type = args.type
    this.id = uuidv4() as string
    this.plugins = args.plugins
  }

  public async execute(item: Input, existingItemId?: string): Promise<Output> {
    const itemId = existingItemId || (uuidv4() as string)

    const preProcessedItem = await this.preProcess(item, itemId)
    let processedItem: Output
    try {
      processedItem = (await this.process(preProcessedItem, itemId)) as Output
    } catch (e) {
      const error = StellarPlusError.fromUnkownError(e)
      const processedError = await this.processError(error, itemId)
      throw processedError
    }
    const postProcessedItem = await this.postProcess(processedItem, itemId)

    return postProcessedItem as Output
  }

  private async preProcess(item: Input, itemId: string): Promise<Input> {
    let preProcessedItem = item as Input

    for (const plugin of this.plugins) {
      if (plugin.preProcess) {
        preProcessedItem = (await plugin.preProcess(preProcessedItem, this.getMeta(itemId))) as Input
      }
    }

    return preProcessedItem
  }

  private async postProcess(item: Output, itemId: string): Promise<Output> {
    let postProcessedItem = item

    for (const plugin of this.plugins) {
      if (plugin.postProcess) {
        postProcessedItem = (await plugin.postProcess(postProcessedItem, this.getMeta(itemId))) as Output
      }
    }

    return postProcessedItem
  }

  private async processError(error: StellarPlusError, itemId: string): Promise<StellarPlusError> {
    let processedError = error

    for (const plugin of this.plugins) {
      if (plugin.processError) {
        processedError = (await plugin.processError(processedError, this.getMeta(itemId))) as StellarPlusError
      }
    }

    return processedError
  }

  protected async process(_item: Input, _itemId: string): Promise<Output> {
    throw new Error('process function not implemented')
  }

  protected getMeta(itemId: string): BeltMetadata {
    return {
      itemId,
      beltId: this.id,
      beltType: this.type as string,
    }
  }

  // private async errorProcess(error: StellarPlusError, itemId: string, beltId: string): Promise<StellarPlusError> {
  //   let processedError = error

  //   for (const plugin of this.plugins) {
  //     if (plugin.errorProcess) {
  //       processedError = (await plugin.errorProcess(processedError, itemId, beltId)) as StellarPlusError
  //     }
  //   }

  //   return processedError
  // }
}
