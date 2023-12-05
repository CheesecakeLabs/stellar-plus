import { Horizon } from 'stellar-sdk'

import { Network } from '@stellar-plus/types'

//
// Allows for account data to be fetched from the network
// through the Horizon API
//
export type AccountDataViewer = {
  getBalances(): Promise<
    (
      | Horizon.BalanceLineNative
      | Horizon.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.BalanceLineLiquidityPool
    )[]
  >
  getTransactions(): Promise<void>
}

export type AccountDataViewerConstructor = {
  network?: Network
}
