import { Transaction } from '@stellar/stellar-sdk'

import { Constants } from 'stellar-plus'
import { DefaultAccountHandler } from 'stellar-plus/account'
import { SimpleKeyPairMock, mockedSimpleKeyPair } from 'stellar-plus/test/mocks/accounts'
import {
  mockSignedClassicTransactionXdr,
  mockUnsignedClassicTransaction,
} from 'stellar-plus/test/mocks/classic-transaction'

describe('DefaultAccountHandler', () => {
  let mockKeypair: SimpleKeyPairMock
  let mockUnsignedTx: Transaction
  let mockSignedTxXdr: string

  const mockedNetwork = Constants.testnet

  beforeEach(() => {
    mockKeypair = mockedSimpleKeyPair
    mockUnsignedTx = mockUnsignedClassicTransaction
    mockSignedTxXdr = mockSignedClassicTransactionXdr
  })

  it('should create an instance with a provided secret key', () => {
    const secretKey = mockKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    expect(client.getPublicKey()).toBe(mockKeypair.publicKey)
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
    const secretKey = mockKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    const publicKey = client.getPublicKey()
    expect(publicKey).toBe(mockKeypair.publicKey)
  })

  it("should sign a transaction with the account's secret key", () => {
    const secretKey = mockKeypair.secretKey
    const client = new DefaultAccountHandler({ secretKey })
    const signedTx = client.sign(mockUnsignedTx)
    expect(signedTx).toEqual(mockSignedTxXdr)
  })
})
