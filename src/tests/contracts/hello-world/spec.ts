/* eslint-disable */

// Based on the demo-contract project
// within the Hyperledger Cacti repository
// https://github.com/hyperledger/cacti/tree/main/packages/cacti-plugin-ledger-connector-stellar/src/test/rust/demo-contract

// spell-checker:disable
export const spec = [
  'AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAABU5hbWVzAAAAAAAAAQAAAAAAAAAHQmFsYW5jZQAAAAABAAAAEw==',
  'AAAAAAAAAAAAAAAJc2F5X2hlbGxvAAAAAAAAAAAAAAEAAAAR',
  'AAAAAAAAAAAAAAAMc2F5X2hlbGxvX3RvAAAAAQAAAAAAAAACdG8AAAAAABEAAAABAAAD6gAAABE=',
  'AAAAAAAAAAAAAAAIZ2V0X25hbWUAAAAAAAAAAQAAABE=',
  'AAAAAAAAAAAAAAAIc2V0X25hbWUAAAABAAAAAAAAAARuYW1lAAAAEQAAAAA=',
  'AAAAAAAAAAAAAAARZ2V0X25hbWVfYnlfaW5kZXgAAAAAAAABAAAAAAAAAAVpbmRleAAAAAAAAAQAAAABAAAAEQ==',
  'AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAIYXNzZXRfaWQAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA',
]
// spell-checker:enable

export enum methods {
  initialize = 'initialize',
  getContractGlobals = 'get_contract_globals',
  setOwner = 'set_owner',
  deposit = 'deposit',
  getUserInfo = 'get_user_info',
}

export type InitializeArgs = { admin: string; token: string }
export type GetContractGlobalsArgs = {}
export type SetOwnerArgs = { to: string; new_owner: string }
export type DepositArgs = { from: string; amount: number; asset: string }
export type GetUserInfoArgs = { from: string }

export type InitializeResponse = null
export type GetContractGlobalsResponse = { admin: string; token: string }
export type SetOwnerResponse = null
export type DepositResponse = null
export type GetUserInfoResponse = {
  balance: number
  name: string
}

export enum ContractErrors {
  AlreadyInitialized = 1,
  NotInitialized = 2,
  NotOwner = 3,
  MismatchingAsset = 4,
}
