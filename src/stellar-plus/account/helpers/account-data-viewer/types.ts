import { Horizon } from '@stellar/stellar-sdk'

import { Network } from '@stellar-plus/types'

//
// Allows for account data to be fetched from the network
// through the Horizon API
//
export type AccountDataViewer = {
  getBalances(): Promise<
    (
      | Horizon.HorizonApi.BalanceLineNative
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.HorizonApi.BalanceLineLiquidityPool
    )[]
  >
  getTransactions(): Promise<void>
}

export type AccountDataViewerConstructor = {
  network?: Network
}
