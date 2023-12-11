import { Account, Horizon } from '@stellar/stellar-sdk'

export type HorizonHandler = {
  server: Horizon.Server
  loadAccount(accountId: string): Promise<Account>
}
