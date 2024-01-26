import { StellarPlusError } from 'stellar-plus/error'
import { BeltMetadata, BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class DebugPlugin<Input, Output> implements BeltPluginType<Input, Output, GenericPlugin> {
  readonly name: string = 'DebugPlugin'
  readonly type: GenericPlugin

  private debugLevel: 'all' | 'info' | 'warn' | 'error'

  constructor(debugLevel: 'info' | 'error' | 'all' = 'error') {
    this.type = GenericPlugin.id
    this.debugLevel = debugLevel
  }

  public async preProcess(item: Input, meta: BeltMetadata): Promise<Input> {
    this.log('info', `>> Start ${meta.beltType}`)
    this.log('all', `  Belt:${meta.beltId} \n  Item:${meta.itemId}`)

    return item
  }

  public async postProcess(item: Output, meta: BeltMetadata): Promise<Output> {
    this.log('info', `<< Finish ${meta.beltType}`)
    this.log('all', `  Belt:${meta.beltId} \n  Item:${meta.itemId}`)

    return item
  }

  public async processError(error: StellarPlusError, _meta: BeltMetadata): Promise<StellarPlusError> {
    this.log('error', `Error: ${error}`)

    return error
  }

  private log = (level: 'all' | 'info' | 'warn' | 'error', message: string): void => {
    if (this.debugLevel === 'all' || this.debugLevel === level) {
      console.log(message)
    }
  }
}
