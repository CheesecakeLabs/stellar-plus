import { AccountResponse } from 'stellar-sdk'

import { HorizonServer } from '@stellar-plus/types'

export type HorizonHandler = {
  server: HorizonServer
  loadAccount(accountId: string): Promise<AccountResponse>
}
