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
