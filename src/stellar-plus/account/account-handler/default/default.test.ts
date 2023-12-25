import { Transaction } from '@stellar/stellar-sdk'

import { Constants } from 'stellar-plus'
import { DefaultAccountHandler } from 'stellar-plus/account'
import {
  mockSignedClassicTransactionXdr,
  mockUnsignedClassicTransaction,
} from 'stellar-plus/test/mocks/classic-transaction'
import { SimpleKeyPairMock, mockedSimpleKeyPair } from 'stellar-plus/test/mocks/stellar-account'

describe('DefaultAccountHandler', () => {
  let mockedKeypair: SimpleKeyPairMock
  let mockedUnsignedTx: Transaction
  let mockedSignedTxXdr: string

  beforeEach(() => {
    mockedKeypair = mockedSimpleKeyPair
    mockedUnsignedTx = mockUnsignedClassicTransaction
    mockedSignedTxXdr = mockSignedClassicTransactionXdr
  })

  it('should create an instance with a provided secret key', () => {
    const secretKey = mockedKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    expect(client.secretKey).toBe(secretKey)
  })

  it('should create an instance with a random secret key', () => {
    const client = new DefaultAccountHandler({ network: Constants.testnet })
    // Check if the secret key starts with 'S'
    expect(client.secretKey).toMatch(/^S/)
    // Check the length of the secret key (assuming the length is known, e.g., 56)
    expect(client.secretKey).toHaveLength(56)
    // Use a regular expression to validate the format (this regex is just an example)
    const secretKeyRegex = /^S[A-Z2-7]{55}$/
    expect(client.secretKey).toMatch(secretKeyRegex)
  })

  it('should return the public key of the account', () => {
    const secretKey = mockedKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    const publicKey = client.getPublicKey()
    expect(publicKey).toBe(mockedKeypair.publicKey)
  })

  it("should sign a transaction with the account's secret key", () => {
    const secretKey = mockedKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    const signedTx = client.sign(mockedUnsignedTx)
    expect(signedTx).toEqual(mockedSignedTxXdr)
  })
})
