import { BeltPluginType, GenericPlugin } from '../../conveyor-belts/types'

export const genericPluginFactory = <Input, Output, BeltType>(
  preProcess: (item: Input, itemId: string, beltId: string) => Promise<Input>,
  postProcess: (item: Output, itemId: string, beltId: string) => Promise<Output>
): BeltPluginType<Input, Output, BeltType> => {
  return new (class implements BeltPluginType<Input, Output, BeltType> {
    type: GenericPlugin = 'GenericPlugin'
    preProcess: (item: Input, itemId: string, beltId: string) => Promise<Input>
    postProcess: (item: Output, itemId: string, beltId: string) => Promise<Output>
    constructor(
      preProcess: (item: Input, itemId: string, beltId: string) => Promise<Input>,
      postProcess: (item: Output, itemId: string, beltId: string) => Promise<Output>
    ) {
      this.preProcess = preProcess
      this.postProcess = postProcess
    }
  })(preProcess, postProcess)
}
