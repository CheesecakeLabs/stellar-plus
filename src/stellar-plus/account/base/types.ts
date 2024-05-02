import { Horizon } from '@stellar/stellar-sdk'

import { HorizonHandler } from 'stellar-plus/horizon/types'
import { NetworkConfig } from 'stellar-plus/network'

export type AccountBase = {
  getPublicKey(): string
  initializeWithFriendbot(): Promise<void>
  getBalances(): Promise<
    (
      | Horizon.HorizonApi.BalanceLineNative
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
      | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
      | Horizon.HorizonApi.BalanceLineLiquidityPool
    )[]
  >
}

export type AccountBasePayload = {
  publicKey: string
  networkConfig?: NetworkConfig
  horizonHandler?: HorizonHandler
}
