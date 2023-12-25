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

  const mockedNetwork = Constants.testnet

  beforeEach(() => {
    mockedKeypair = mockedSimpleKeyPair
    mockedUnsignedTx = mockUnsignedClassicTransaction
    mockedSignedTxXdr = mockSignedClassicTransactionXdr
  })

  it('should create an instance with a provided secret key', () => {
    const secretKey = mockedKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    expect(client.getPublicKey()).toBe(mockedKeypair.publicKey)
  })

  it('should create an instance with a random secret key', () => {
    const client = new DefaultAccountHandler({ network: mockedNetwork })
    // Check if the public key starts with 'G'
    expect(client.getPublicKey()).toMatch(/^G/)
    // Check the length of the public key (assuming the length is known, e.g., 56)
    expect(client.getPublicKey()).toHaveLength(56)
    // Use a regular expression to validate the format (this regex is just an example)
    const publicKeyRegex = /^G[A-Z2-7]{55}$/
    expect(client.getPublicKey()).toMatch(publicKeyRegex)
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
