import { SorobanDataBuilder, Asset as StellarAsset, xdr } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { EnvelopeHeader, FeeBumpHeader, TransactionInvocation } from 'stellar-plus/core/types'

export type SorobanInvokeArgs<T> = SorobanSimulateArgs<T> & {
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}

export type SorobanSimulateArgs<T> = {
  method: string
  methodArgs: T
  header: EnvelopeHeader
}

export type SorobanUploadArgs = TransactionInvocation & {
  wasm: Buffer
}

export type SorobanDeployArgs = TransactionInvocation & {
  wasmHash: string
}

export type WrapClassicAssetArgs = TransactionInvocation & {
  asset: StellarAsset
}

export type ExtendFootprintTTLArgs = TransactionInvocation & {
  extendTo: number
  footprint: xdr.LedgerFootprint
}

export type RestoreFootprintArgs = TransactionInvocation &
  (RestoreFootprintWithLedgerKeys | RestoreFootprintWithRestorePreamble)

export type RestoreFootprintWithLedgerKeys = {
  keys: xdr.LedgerKey[]
}

export type RestoreFootprintWithRestorePreamble = {
  restorePreamble: {
    minResourceFee: string
    transactionData: SorobanDataBuilder
  }
}

export function isRestoreFootprintWithLedgerKeys(
  args: RestoreFootprintArgs
): args is RestoreFootprintWithLedgerKeys & TransactionInvocation {
  return 'keys' in args
}

export function isRestoreFootprintWithRestorePreamble(
  args: RestoreFootprintArgs
): args is RestoreFootprintWithRestorePreamble & TransactionInvocation {
  return 'restorePreamble' in args
}
