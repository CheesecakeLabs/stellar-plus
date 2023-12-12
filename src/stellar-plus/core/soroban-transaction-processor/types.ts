import { Asset as StellarAsset } from '@stellar/stellar-sdk'

import { AccountHandler } from '@account/account-handler/types'
import { EnvelopeHeader, FeeBumpHeader } from '@core/types'

export type SorobanInvokeArgs<T> = SorobanSimulateArgs<T> & {
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}

export type SorobanSimulateArgs<T> = {
  method: string
  methodArgs: T
  header: EnvelopeHeader
}

export type SorobanUploadArgs = {
  wasm: Buffer
  header: EnvelopeHeader
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}

export type SorobanDeployArgs = {
  wasmHash: string
  header: EnvelopeHeader
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}

export type WrapClassicAssetArgs = {
  asset: StellarAsset
  header: EnvelopeHeader
  signers: AccountHandler[]
  feeBump?: FeeBumpHeader
}
