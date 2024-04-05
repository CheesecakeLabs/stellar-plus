import * as freighterApi from '@stellar/freighter-api'
import { FeeBumpTransaction, Transaction, xdr } from '@stellar/stellar-sdk'

import { FreighterAccountHandlerClient } from 'stellar-plus/account/account-handler/freighter'
import { FAHError } from 'stellar-plus/account/account-handler/freighter/errors'
import { testnet } from 'stellar-plus/constants'

jest.mock('@stellar/freighter-api', () => ({
  getPublicKey: jest.fn(),
  isConnected: jest.fn(),
  isAllowed: jest.fn(),
  setAllowed: jest.fn().mockResolvedValue(true),
  signTransaction: jest.fn(),
  getNetworkDetails: jest.fn(),
  signAuthEntry: jest.fn(),
}))

const MOCKED_GET_PUBLIC_KEY = freighterApi.getPublicKey as jest.Mock
const MOCKED_IS_CONNECTED = freighterApi.isConnected as jest.Mock
const MOCKED_IS_ALLOWED = freighterApi.isAllowed as jest.Mock
const MOCKED_SET_ALLOWED = freighterApi.setAllowed as jest.Mock
const MOCKED_SIGN_TRANSACTION = freighterApi.signTransaction as jest.Mock
const MOCKED_GET_NETWORK_DETAILS = freighterApi.getNetworkDetails as jest.Mock
const MOCKED_SIGN_AUTH_ENTRY = freighterApi.signAuthEntry as jest.Mock

const mockFreighterIsInstalled = (status: boolean): void => {
  MOCKED_IS_CONNECTED.mockResolvedValue(status)
}
const mockFreighterIsAllowed = (status: boolean): void => {
  MOCKED_IS_ALLOWED.mockResolvedValue(status)
}

const mockFreighterGetPublicKey = (pk: string): void => {
  MOCKED_GET_PUBLIC_KEY.mockResolvedValue(pk)
}

const mockFreighterGetNetworkDetailsTestnet = (): void => {
  MOCKED_GET_NETWORK_DETAILS.mockResolvedValue({ networkPassphrase: testnet.networkPassphrase })
}

const mockFreighterGetNetworkDetailsWrongNetwork = (): void => {
  MOCKED_GET_NETWORK_DETAILS.mockResolvedValue({ networkPassphrase: 'wrong network' })
}

const TESTNET_CONFIG = testnet

const MOCKED_PK = 'GAUFIAL2LV2OV7EA4NTXZDVPQASGI5Y3EXZV2HQS3UUWMZ7UWJDQURYS'

describe('FreighterAccountHandlerClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('Initialization', () => {
    it('should initialize with the networkConfig', () => {
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      expect(fah).toBeDefined()
    })
  })

  describe('Connect', () => {
    it('should load and set the public key when connected', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetNetworkDetailsTestnet()
      mockFreighterGetPublicKey(MOCKED_PK)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.connect()

      expect(MOCKED_IS_CONNECTED).toHaveBeenCalled()
      expect(MOCKED_IS_ALLOWED).toHaveBeenCalled()
      expect(MOCKED_GET_PUBLIC_KEY).toHaveBeenCalled()
      expect(MOCKED_GET_NETWORK_DETAILS).toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe(MOCKED_PK)
    })

    it('should trigger permission if extension is not allowed', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(false)
      mockFreighterGetNetworkDetailsTestnet()
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.connect()

      expect(MOCKED_IS_CONNECTED).toHaveBeenCalled()
      expect(MOCKED_SET_ALLOWED).toHaveBeenCalled()
      expect(MOCKED_GET_PUBLIC_KEY).not.toHaveBeenCalled()
      expect(MOCKED_GET_NETWORK_DETAILS).not.toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe('')
    })

    it('should trigger permission if extension is not allowed then load the public key and call the provided callback', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_IS_ALLOWED.mockResolvedValue(true).mockResolvedValueOnce(false) // will return false once then only true
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      const mockedCallBack = jest.fn().mockImplementationOnce((pk: string) => {
        // Necessary to break AAA here to ensure assertion only when callback is called
        expect(MOCKED_GET_PUBLIC_KEY).toHaveBeenCalled()
        expect(pk).toBe(MOCKED_PK)
        expect(mockedCallBack).toHaveBeenCalledExactlyOnceWith(MOCKED_PK)
        expect(MOCKED_IS_CONNECTED).toHaveBeenCalledTimes(2)
        expect(MOCKED_IS_ALLOWED).toHaveBeenCalledTimes(2)
        expect(MOCKED_SET_ALLOWED).toHaveBeenCalledOnce()
      })

      await fah.connect(mockedCallBack)
    })

    it('should not load public key if extension is allowed to the wrong network', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsWrongNetwork()
      mockFreighterIsAllowed(true)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.connect()

      expect(MOCKED_IS_CONNECTED).toHaveBeenCalledOnce()
      expect(MOCKED_IS_ALLOWED).toHaveBeenCalledOnce()
      expect(MOCKED_GET_NETWORK_DETAILS).toHaveBeenCalledOnce()
      expect(MOCKED_GET_PUBLIC_KEY).not.toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe('')
    })

    describe('Disconnect', () => {
      it('should reset the publick key', () => {
        const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.replaceProperty(fah as any, 'publicKey', MOCKED_PK)

        fah.disconnect()

        expect(fah.getPublicKey()).toBe('')
      })
    })
  })

  describe('Load Public Key', () => {
    it('should not load the public key if freighter is not installed', async () => {
      mockFreighterIsInstalled(false)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.loadPublicKey()

      expect(MOCKED_SET_ALLOWED).not.toHaveBeenCalled()
      expect(MOCKED_GET_PUBLIC_KEY).not.toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe('')
    })

    it('should not load the public key if freighter is installed but not allowed', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(false)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.loadPublicKey()

      expect(MOCKED_SET_ALLOWED).not.toHaveBeenCalled()
      expect(MOCKED_GET_PUBLIC_KEY).not.toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe('')
    })

    it('should not load the public key if freighter is connected to the wrong network', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetNetworkDetailsWrongNetwork()
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.loadPublicKey()

      expect(MOCKED_SET_ALLOWED).not.toHaveBeenCalled()
      expect(MOCKED_GET_PUBLIC_KEY).not.toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe('')
    })

    it('should load the public key if freighter is installed and allowed', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetNetworkDetailsTestnet()
      mockFreighterGetPublicKey(MOCKED_PK)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await fah.loadPublicKey()

      expect(MOCKED_GET_PUBLIC_KEY).toHaveBeenCalled()
      expect(fah.getPublicKey()).toBe(MOCKED_PK)
    })

    it('should trigger permission when enforceConnection is true and then load the public key and trigger the callback', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_IS_ALLOWED.mockResolvedValue(true).mockResolvedValueOnce(false) // will return false once then only true
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      const mockedCallBack = jest.fn().mockImplementationOnce((pk: string) => {
        // Necessary to break AAA here to ensure assertion only when callback is called
        expect(MOCKED_GET_PUBLIC_KEY).toHaveBeenCalled()
        expect(pk).toBe(MOCKED_PK)
        expect(mockedCallBack).toHaveBeenCalledExactlyOnceWith(MOCKED_PK)
        expect(MOCKED_IS_CONNECTED).toHaveBeenCalledTimes(2)
        expect(MOCKED_IS_ALLOWED).toHaveBeenCalledTimes(2)
        expect(MOCKED_SET_ALLOWED).toHaveBeenCalledOnce()
      })

      await fah.loadPublicKey(mockedCallBack, true)
    })
  })

  describe('Core signing features', () => {
    it('should sign a transaction with freighter', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_SIGN_TRANSACTION.mockResolvedValue('signedTx')
      const mockedTx = {
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as unknown as Transaction
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      const signedTx = await fah.sign(mockedTx)

      expect(mockedTx.toXDR).toHaveBeenCalledOnce()
      expect(MOCKED_SIGN_TRANSACTION).toHaveBeenCalledExactlyOnceWith('mocked xdr', {
        networkPassphrase: TESTNET_CONFIG.networkPassphrase,
        accountToSign: MOCKED_PK,
      })
      expect(signedTx).toBe('signedTx')
    })

    it('should sign a fee bump transaction with freighter', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_SIGN_TRANSACTION.mockResolvedValue('signedTx')
      const mockedTx = {
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as unknown as FeeBumpTransaction
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      const signedTx = await fah.sign(mockedTx)

      expect(mockedTx.toXDR).toHaveBeenCalledOnce()
      expect(MOCKED_SIGN_TRANSACTION).toHaveBeenCalledExactlyOnceWith('mocked xdr', {
        networkPassphrase: TESTNET_CONFIG.networkPassphrase,
        accountToSign: MOCKED_PK,
      })
      expect(signedTx).toBe('signedTx')
    })

    it('should sign a soroban authorization entry with freighter', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_SIGN_AUTH_ENTRY.mockResolvedValue('signedAuthEntry')
      const mockedAuthEntry = {
        credentials: jest.fn(),
        rootInvocation: jest.fn(),
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as xdr.SorobanAuthorizationEntry
      const spyXdr = jest.spyOn(xdr.SorobanAuthorizationEntry, 'fromXDR').mockImplementationOnce(() => mockedAuthEntry)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      const signedAuthEntry = await fah.signSorobanAuthEntry(mockedAuthEntry, 0, TESTNET_CONFIG.networkPassphrase)

      expect(mockedAuthEntry.toXDR).toHaveBeenCalledOnce()
      expect(MOCKED_SIGN_AUTH_ENTRY).toHaveBeenCalledExactlyOnceWith('mocked xdr', {
        accountToSign: MOCKED_PK,
      })
      expect(spyXdr).toHaveBeenCalledExactlyOnceWith('signedAuthEntry', 'base64')
      expect(signedAuthEntry).toBe(mockedAuthEntry)
    })
  })

  describe('Errors', () => {
    const MOCKED_ERROR = new Error('mocked error')

    it('should throw when failed to load public key', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetNetworkDetailsTestnet()
      MOCKED_GET_PUBLIC_KEY.mockRejectedValue(MOCKED_ERROR)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await expect(fah.loadPublicKey()).rejects.toThrow(FAHError.failedToLoadPublicKeyError(MOCKED_ERROR))
    })

    it('should throw when failed to sign transaction', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      const mockedTx = {
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as unknown as Transaction
      MOCKED_SIGN_TRANSACTION.mockRejectedValue(MOCKED_ERROR)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      await expect(fah.sign(mockedTx)).rejects.toThrow(FAHError.failedToSignTransactionError(MOCKED_ERROR))
    })

    it('should throw when trying to sign a transaction with Freighter when it is not connected', async () => {
      mockFreighterIsInstalled(false)
      const mockedTx = {
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as unknown as Transaction
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await expect(fah.sign(mockedTx)).rejects.toThrow(FAHError.freighterIsNotConnectedError())
    })

    it('should throw when failed to sign a soroban authorization entry', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      const mockedAuthEntry = {
        credentials: jest.fn(),
        rootInvocation: jest.fn(),
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as xdr.SorobanAuthorizationEntry
      MOCKED_SIGN_AUTH_ENTRY.mockRejectedValue(MOCKED_ERROR)
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      await expect(fah.signSorobanAuthEntry(mockedAuthEntry, 0, TESTNET_CONFIG.networkPassphrase)).rejects.toThrow(
        FAHError.failedToSignAuthEntryError(MOCKED_ERROR)
      )
    })

    it('should throw when trying to sign a soroban authorization entry with Freighter when it is not connected', async () => {
      mockFreighterIsInstalled(false)
      const mockedAuthEntry = {
        credentials: jest.fn(),
        rootInvocation: jest.fn(),
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as xdr.SorobanAuthorizationEntry
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })

      await expect(fah.signSorobanAuthEntry(mockedAuthEntry, 0, TESTNET_CONFIG.networkPassphrase)).rejects.toThrow(
        FAHError.freighterIsNotConnectedError()
      )
    })

    it('should throw when trying to sign a soroban authorization entry with Freighter when it is connected to a different network than the one requested to sign for', async () => {
      mockFreighterIsInstalled(true)
      mockFreighterIsAllowed(true)
      mockFreighterGetPublicKey(MOCKED_PK)
      mockFreighterGetNetworkDetailsTestnet()
      const mockedAuthEntry = {
        credentials: jest.fn(),
        rootInvocation: jest.fn(),
        toXDR: jest.fn().mockReturnValue('mocked xdr'),
      } as xdr.SorobanAuthorizationEntry
      const fah = new FreighterAccountHandlerClient({ networkConfig: TESTNET_CONFIG })
      await fah.loadPublicKey()

      await expect(fah.signSorobanAuthEntry(mockedAuthEntry, 0, 'wrong network')).rejects.toThrow(
        FAHError.cannotSignForThisNetwork('wrong network', TESTNET_CONFIG.networkPassphrase)
      )
    })
  })
})
