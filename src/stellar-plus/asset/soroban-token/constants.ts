import { ContractSpec } from '@stellar/stellar-sdk'

export const spec = new ContractSpec([])

export enum methods {
  balance = 'balance',
  spendable_balance = 'spendable_balance',
  allowance = 'allowance',
  set_admin = 'set_admin',
  admin = 'admin',
  set_authorized = 'set_authorized',
  mint = 'mint',
  clawback = 'clawback',
  approve = 'approve',
  transfer = 'transfer',
  transfer_from = 'transfer_from',
  burn = 'burn',
  burn_from = 'burn_from',
  decimals = 'decimals',
  name = 'name',
  symbol = 'symbol',
}
