import { ClassicAssetHandler as _ClassicAssetHandler } from 'stellar-plus/asset/classic'
import { SorobanTokenHandler as _SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
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

export type ClassicAssetHandler = typeof _ClassicAssetHandler
export type SorobanTokenHandler = typeof _SorobanTokenHandler
export type SACAssetHandler = typeof SACHandler
