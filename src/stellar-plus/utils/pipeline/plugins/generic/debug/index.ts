import { StellarPlusError } from 'stellar-plus/error'
import { BeltMetadata, BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class DebugPlugin<Input, Output> implements BeltPluginType<Input, Output, GenericPlugin> {
  readonly name: string = 'DebugPlugin'
  readonly type: GenericPlugin

  private level: 'debug' | 'info' | 'warn' | 'error'

  constructor(level: 'info' | 'error' | 'debug' = 'error') {
    this.type = 'GenericPlugin'
    this.level = level
  }

  // public async preProcess(item: Input, meta: BeltMetadata): Promise<Input> {
  //   if (this.level === 'debug') {
  //     console.log('Preprocessing belt:', meta.beltId, ' item:', meta.itemId)
  //   }
  //   return item
  // }

  public async postProcess(item: Output, meta: BeltMetadata): Promise<Output> {
    if (this.level === 'debug') {
      console.log(`Finished processing:\n  Type:${meta.beltType} \n Belt:${meta.beltId} \n  Item:${meta.itemId}`)
    }

    return item
  }

  public async processError(error: StellarPlusError, _meta: BeltMetadata): Promise<StellarPlusError> {
    console.log('DEBUG ERROR:', error)

    return error
  }
}
