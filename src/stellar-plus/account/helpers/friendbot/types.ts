import { Network } from 'stellar-plus/types'

//
// Allows for accounts to be initialized with Friendbot
//
export type Friendbot = {
  initialize(): Promise<void>
}

export type FriendbotConstructor = {
  network?: Network
}
