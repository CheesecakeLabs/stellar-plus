import { ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { SACHandler } from 'stellar-plus/asset/stellar-asset-contract'

export enum AssetTypes {
  native = 'native',
  credit_alphanum4 = 'credit_alphanum4',
  credit_alphanum12 = 'credit_alphanum12',
  SAC = 'SAC',
  token = 'token',
  liquidity_pool_shares = 'liquidity_pool_shares',
}

export type AssetType = {
  type: AssetTypes
}

export type ClassicAssetHandlerType = typeof ClassicAssetHandler
export type SorobanTokenHandlerType = typeof SorobanTokenHandler
export type SACAssetHandlerType = typeof SACHandler
