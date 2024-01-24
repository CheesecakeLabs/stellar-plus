import { StellarPlusError } from 'stellar-plus/error'
import { BeltMetadata, BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class DebugPlugin<Input, Output> implements BeltPluginType<Input, Output, GenericPlugin> {
  readonly name: string = 'DebugPlugin'
  readonly type: GenericPlugin

  private level: 'debug' | 'info' | 'warn' | 'error'

  constructor(level: 'info' | 'error' = 'error') {
    this.type = 'GenericPlugin'
    this.level = level
  }

  // public async preProcess(item: Input, _meta: BeltMetadata): Promise<Input> {
  //   return item
  // }

  // public async postProcess(item: Output, meta: BeltMetadata): Promise<Output> {
  //   const logId = this.getLogId(meta)
  //   this.stopTimer(logId)
  //   if (this.level === 'debug') {
  //     this.log(meta)
  //   }

  //   return item
  // }

  public async processError(error: StellarPlusError, _meta: BeltMetadata): Promise<StellarPlusError> {
    console.log('DEBUG ERROR:', error)

    return error
  }
}
