import { Spec } from '@stellar/stellar-sdk/contract'

import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { ClassicAssetHandlerConstructorArgs } from 'stellar-plus/asset/classic/types'
import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { AssetType } from 'stellar-plus/asset/types'
import { Options } from 'stellar-plus/core/contract-engine/types'
import { NetworkConfig } from 'stellar-plus/types'

export type SACHandler = AssetType & {
  classicHandler: ClassicAssetHandler
  sorobanTokenHandler: SorobanTokenHandler
}

export type SACConstructorArgs = ClassicAssetHandlerConstructorArgs & {
  networkConfig: NetworkConfig
  contractParameters?: {
    spec?: Spec
    contractId?: string
    wasm?: Buffer
    wasmHash?: string
  }
  options?: Options
}
