import { Horizon } from '@stellar/stellar-sdk'

import { NetworkConfig } from 'stellar-plus/types'

export type AccountDataViewer = {
  getBalances(): Promise<
    (
      | Horizon.HorizonApi.BalanceLineNative
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.HorizonApi.BalanceLineLiquidityPool
    )[]
  >
}

export type AccountDataViewerConstructor = {
  networkConfig?: NetworkConfig
}
