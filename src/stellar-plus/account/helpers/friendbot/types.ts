import { NetworkConfig } from 'stellar-plus/types'

export type Friendbot = {
  initialize(): Promise<void>
}

export type FriendbotConstructor = {
  networkConfig?: NetworkConfig
}
