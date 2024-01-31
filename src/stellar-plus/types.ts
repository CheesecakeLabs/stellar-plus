import {
  Address as StellarAddress,
  FeeBumpTransaction as _FeeBumpTransaction,
  Transaction as _Transaction,
} from '@stellar/stellar-sdk'

import {
  EnvelopeHeader as _EnvelopeHeader,
  FeeBumpHeader as _FeeBumpHeader,
  TransactionInvocation as _TransactionInvocation,
} from 'stellar-plus/core/types'

export type TransactionXdr = string

export type Transaction = _Transaction

export type FeeBumpTransaction = _FeeBumpTransaction

//
// Networks
//
export type NetworkConfig = {
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

export type TransactionInvocation = _TransactionInvocation
export type EnvelopeHeader = _EnvelopeHeader
export type FeeBumpHeader = _FeeBumpHeader

export * as Errors from 'stellar-plus/error/types'
