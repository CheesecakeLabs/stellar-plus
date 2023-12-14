import { Address as StellarAddress } from '@stellar/stellar-sdk'

export type TransactionXdr = string

//
// Networks
//
export type Network = {
  name: NetworksList
  networkPassphrase: string
  rpcUrl: string
  horizonUrl: string
  friendbotUrl?: string
}

export enum NetworksList {
  testnet = 'testnet',
  futurenet = 'futurenet',
  mainnet = 'mainnet',
  custom = 'custom',
}

export type u32 = number
export type i32 = number
export type u64 = bigint
export type i64 = bigint
export type u128 = bigint
export type i128 = bigint
export type u256 = bigint
export type i256 = bigint
export type Option<T> = T | undefined
export type Typepoint = bigint
export type Duration = bigint

export type Address = StellarAddress | string
