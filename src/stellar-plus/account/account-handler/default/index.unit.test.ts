/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FeeBumpTransaction, Keypair, Transaction, authorizeEntry, xdr } from '@stellar/stellar-sdk'

import { DefaultAccountHandlerClient } from 'stellar-plus/account/account-handler/default'
import { DAHError } from 'stellar-plus/account/account-handler/default/errors'
import { testnet } from 'stellar-plus/constants'

jest.mock('@stellar/stellar-sdk', () => {
  // The mock doesnt spread the whole originalModule because some internal exported objects cause failures
  // so we just unmock the necessary items.
  // uncomment and use the following line if you need to check the contents of the module:
  // const originalModule: typeof import('@stellar/stellar-sdk') = jest.requireActual('@stellar/stellar-sdk')
  const originalModule = jest.requireActual('@stellar/stellar-sdk')
  return {
    Horizon: originalModule.Horizon,
    Keypair: originalModule.Keypair,
    Transaction: originalModule.Transaction,
    FeeBumpTransaction: originalModule.FeeBumpTransaction,
    xdr: originalModule.xdr,
    authorizeEntry: jest.fn(),
  }
})

const MOCKED_AUTHORIZE_ENTRY = authorizeEntry as jest.Mock

const MOCKED_SOROBAN_AUTH_ENTRY = {
  credentials: jest.fn(),
  rootInvocation: jest.fn(),
  toXDR: jest.fn(),
} as xdr.SorobanAuthorizationEntry

const TESTNET_CONFIG = testnet

describe('DefaultAccountHandler', () => {
  describe('Initialization', () => {
    it('should initialize with just the networkConfig and generate a keypair', () => {
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      const spySecretKey = jest.mocked((dah as any).secretKey)

      expect(spySecretKey).toBeDefined()
      expect(dah.getPublicKey()).toBe(Keypair.fromSecret(spySecretKey as string).publicKey())
    })

    it('should initialize with a secret key', () => {
      const secretKey = Keypair.random().secret()
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey })

      expect(dah.getPublicKey()).toBe(Keypair.fromSecret(secretKey).publicKey())
    })

    it('should sign a transaction with its secret key', () => {
      const keypair = Keypair.random()
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey: keypair.secret() })
      const mockedXdrResult = 'Mocked XDR Result'
      const mockedTx = {
        sign: jest.fn().mockReturnValue('Signed'),
        toXDR: jest.fn().mockReturnValue(mockedXdrResult),
      } as unknown as Transaction
      const spySign = jest.spyOn(mockedTx, 'sign')

      const signedTx = dah.sign(mockedTx)

      expect(signedTx).toBe(mockedXdrResult)
      expect(spySign).toHaveBeenCalledExactlyOnceWith(keypair)
    })

    it('should sign a fee bummp transaction with its secret key', () => {
      const keypair = Keypair.random()
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey: keypair.secret() })
      const mockedXdrResult = 'Mocked XDR Result'
      const mockedTx = {
        sign: jest.fn().mockReturnValue('Signed'),
        toXDR: jest.fn().mockReturnValue(mockedXdrResult),
      } as unknown as FeeBumpTransaction
      const spySign = jest.spyOn(mockedTx, 'sign')

      const signedTx = dah.sign(mockedTx)

      expect(signedTx).toBe(mockedXdrResult)
      expect(spySign).toHaveBeenCalledExactlyOnceWith(keypair)
    })

    it('should sign a soroban authorization entry with its secret key', async () => {
      const keypair = Keypair.random()
      MOCKED_AUTHORIZE_ENTRY.mockImplementationOnce(() => MOCKED_SOROBAN_AUTH_ENTRY)
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey: keypair.secret() })

      const signedEntry = await dah.signSorobanAuthEntry(
        MOCKED_SOROBAN_AUTH_ENTRY,
        123,
        TESTNET_CONFIG.networkPassphrase
      )

      expect(signedEntry).toBe(MOCKED_SOROBAN_AUTH_ENTRY)
      expect(MOCKED_AUTHORIZE_ENTRY).toHaveBeenCalledExactlyOnceWith(
        MOCKED_SOROBAN_AUTH_ENTRY,
        keypair,
        123,
        TESTNET_CONFIG.networkPassphrase
      )
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw an error if the secret key provided in the constructor is invalid', () => {
      const invalidSecretKey = 'Mocked Secret Key'

      expect(() => {
        new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey: invalidSecretKey })
      }).toThrow(DAHError.failedToLoadSecretKeyError(new Error('Mocked error')))
    })

    it('should throw an error if the public key cannot be derived from the current secret key', () => {
      const invalidSecret = 'Mocked Secret Key'
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      jest.replaceProperty(dah as any, 'secretKey', invalidSecret)

      expect(dah.getPublicKey).toThrow(DAHError.failedToLoadSecretKeyError(new Error('Mocked error')))
    })

    it('should throw an error if the transaction cannot be signed', () => {
      const keypair = Keypair.random()
      const dah = new DefaultAccountHandlerClient({ networkConfig: TESTNET_CONFIG, secretKey: keypair.secret() })
      const mockedTx = {
        sign: jest.fn().mockImplementationOnce(() => {
          throw new Error('Mocked error')
        }),
        toXDR: jest.fn(),
      } as unknown as Transaction
      const spySign = jest.spyOn(mockedTx, 'sign')

      expect(() => {
        dah.sign(mockedTx)
      }).toThrow(DAHError.failedToSignTransactionError(new Error('Mocked error')))
      expect(spySign).toHaveBeenCalledExactlyOnceWith(keypair)
    })
  })
})
