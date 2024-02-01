import { StellarPlusError } from 'stellar-plus/error'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class InjectPreprocessParameterPlugin<Input, Output, Type, ParameterType>
  implements BeltPluginType<Input, Output, Type>
{
  readonly name: string = 'InjectPreprocessParameterPlugin'
  readonly type: Type

  private parameter: ParameterType
  private step: 'preProcess' | 'postProcess' | 'processError'

  constructor(parameter: ParameterType, type: Type, step: 'preProcess' | 'postProcess' | 'processError') {
    this.type = type
    this.parameter = parameter
    this.step = step
  }

  public async preProcess(item: Input, _meta: BeltMetadata): Promise<Input> {
    return this.step === 'preProcess' ? this.inject(item) : item
  }

  public async postProcess(item: Output, _meta: BeltMetadata): Promise<Output> {
    return this.step === 'postProcess' ? this.inject(item) : item
  }

  public async processError(error: StellarPlusError, _meta: BeltMetadata): Promise<StellarPlusError> {
    return this.step === 'processError' ? this.inject(error) : error
  }

  private inject<ItemType>(item: ItemType): ItemType {
    const updatedItem = {
      ...item,
      ...this.parameter,
    }
    return updatedItem
  }
}
