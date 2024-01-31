import { Account } from '@stellar/stellar-sdk'

import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { ACCOUNT_A_PK, ACCOUNT_A_SK, NETWORK } from 'stellar-plus/test/mocks/constants'

export type SimpleKeyPairMock = {
  publicKey: string
  secretKey: string
}

export const mockedSimpleKeyPair: SimpleKeyPairMock = {
  publicKey: ACCOUNT_A_PK,
  secretKey: ACCOUNT_A_SK,
}

export const mockedStellarAccount: Account = {
  accountId: () => ACCOUNT_A_PK,
  sequenceNumber: () => '12345',
  incrementSequenceNumber: () => {
    return
  },
}

export const mockedDefaultAccountHandler = new DefaultAccountHandler({
  networkConfig: NETWORK,
  secretKey: ACCOUNT_A_SK,
})
