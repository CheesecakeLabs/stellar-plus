/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { cereal, xdr } from '@stellar/stellar-sdk'

// extracted from stellar-sdk
// https://github.com/stellar/js-stellar-sdk/blob/master/src/contract/utils.ts
export function processSpecEntryStream(buffer: Buffer) {
  const reader = new cereal.XdrReader(buffer)
  const res: xdr.ScSpecEntry[] = []
  while (!reader.eof) {
    // @ts-ignore
    res.push(xdr.ScSpecEntry.read(reader))
  }
  return res
}
