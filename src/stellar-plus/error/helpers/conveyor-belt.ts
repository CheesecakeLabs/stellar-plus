export type ConveyorBeltErrorMeta<Input, Meta> = {
  item: Input
  meta: Meta
}

export const extractConveyorBeltErrorMeta = <Input, Meta>(
  item: Input,
  meta: Meta
): ConveyorBeltErrorMeta<Input, Meta> => {
  return {
    item,
    meta,
  }
}
