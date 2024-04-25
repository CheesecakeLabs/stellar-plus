import {
  Address as StellarAddress,
  FeeBumpTransaction as _FeeBumpTransaction,
  Transaction as _Transaction,
} from '@stellar/stellar-sdk'
import { Spec as _Spec } from '@stellar/stellar-sdk/contract'

import {
  EnvelopeHeader as _EnvelopeHeader,
  FeeBumpHeader as _FeeBumpHeader,
  TransactionInvocation as _TransactionInvocation,
} from 'stellar-plus/core/types'
import { NetworkConfig as _NetworkConfig } from 'stellar-plus/network'

export type TransactionXdr = string

export type Transaction = _Transaction

export type FeeBumpTransaction = _FeeBumpTransaction

export type NetworkConfig = _NetworkConfig

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
export type Spec = _Spec

export * as Errors from 'stellar-plus/error/types'
