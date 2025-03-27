/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { cereal, xdr } from '@stellar/stellar-sdk'

// extracted from stellar-sdk
// https://github.com/stellar/js-stellar-sdk/blob/master/src/contract/utils.ts
export function processSpecEntryStream(buffer: Buffer) {
  const reader = new cereal.XdrReader(buffer)
  const res: xdr.ScSpecEntry[] = []
  while (!reader.eof) {
    const entry = xdr.ScSpecEntry.read(reader);
    if (entry instanceof xdr.ScSpecEntry) {
      res.push(entry);
    } else {
      throw new Error("Failed to read ScSpecEntry from reader");
    }
  }
  return res
}
