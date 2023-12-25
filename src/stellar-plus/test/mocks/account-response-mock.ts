import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { balances } from './balances'

export class MockAccountResponse {
  private readonly _baseAccount
  readonly id: string
  readonly paging_token: string
  readonly account_id: string
  sequence: string
  readonly sequence_ledger?: number
  readonly sequence_time?: string
  readonly subentry_count: number
  readonly home_domain?: string
  readonly inflation_destination?: string
  readonly last_modified_ledger!: number
  readonly last_modified_time!: string
  readonly thresholds!: HorizonApi.AccountThresholds
  readonly flags!: HorizonApi.Flags
  readonly balances!: HorizonApi.BalanceLine[]
  readonly signers!: HorizonApi.AccountSigner[]
  readonly data!: (options: { value: string }) => Promise<{ value: string }>
  readonly data_attr!: Record<string, string>

  constructor(
    account_id = 'GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ',
    asset_issuer = 'GCL3QOGZXUN4OSP35ZR6MZHIZPFJNSCT2XPX227HFTDF7DE526FBDZV6'
  ) {
    this.id = 'mock_id'
    this.paging_token = 'mock_paging_token'
    this.account_id = account_id
    this.sequence = '123456'
    this.subentry_count = 0
    this._baseAccount = '_baseAccount'
    this.balances = balances(asset_issuer)
  }

  accountId(): string {
    return this.account_id
  }

  sequenceNumber(): string {
    return this.sequence
  }

  incrementSequenceNumber(): void {
    return
  }
}
