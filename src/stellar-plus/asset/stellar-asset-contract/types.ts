import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { ClassicAssetHandlerConstructorArgs } from 'stellar-plus/asset/classic/types'
import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { SorobanTokenHandlerConstructorArgs } from 'stellar-plus/asset/soroban-token/types'
import { AssetType } from 'stellar-plus/asset/types'

export type SACHandler = AssetType & {

  classicHandler: ClassicAssetHandler
  sorobanTokenHandler: SorobanTokenHandler
}

export type SACConstructorArgs = ClassicAssetHandlerConstructorArgs & SorobanTokenHandlerConstructorArgs
