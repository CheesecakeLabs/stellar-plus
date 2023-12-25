import { Account } from '@stellar/stellar-sdk'

import { ACCOUNT_A_PK, ACCOUNT_A_SK } from './constants'

export type SimpleKeyPairMock = {
  publicKey: string
  secretKey: string
}

export const mockedSimpleKeyPair: SimpleKeyPairMock = {
  publicKey: ACCOUNT_A_PK,
  secretKey: ACCOUNT_A_SK,
}

//mocked account
export const mockedStellarAccount: Account = {
  accountId: () => ACCOUNT_A_PK,
  sequenceNumber: () => '12345',
  incrementSequenceNumber: () => {
    return
  },
}
