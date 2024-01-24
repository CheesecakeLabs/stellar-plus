// import { BeltPluginType, BeltProcessMetadata, GenericPlugin } from '../../conveyor-belts/types'

// export const genericPluginFactory = <Input, Output, BeltType>(args: {
//   preProcess?: (item: Input, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Input>
//   postProcess?: (item: Output, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Output>
// }): BeltPluginType<Input, Output, BeltType> => {
//   return new (class implements BeltPluginType<Input, Output, BeltType> {
//     type: GenericPlugin = 'GenericPlugin'
//     preProcess: (item: Input, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Input>
//     postProcess: (item: Output, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Output>
//     constructor(
//       preProcess: (item: Input, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Input>,
//       postProcess: (item: Output, meta: BeltProcessMetadata<Input, Output, BeltType>) => Promise<Output>
//     ) {
//       this.preProcess = args.preProcess
//       this.postProcess = args.postProcess
//     }
//   })(preProcess, postProcess)
// }
