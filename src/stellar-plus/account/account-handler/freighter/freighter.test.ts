import * as freighterApi from '@stellar/freighter-api'

import { FreighterAccountHandlerClient } from 'stellar-plus/account/account-handler/freighter'
import { testnet } from 'stellar-plus/constants'
import {
  mockSignedClassicTransactionXdr,
  mockUnsignedClassicTransaction,
} from 'stellar-plus/test/mocks/classic-transaction'
import { NetworkConfig } from 'stellar-plus/types'

jest.mock('@stellar/freighter-api', () => ({
  getPublicKey: jest.fn(),
  isConnected: jest.fn(),
  isAllowed: jest.fn(),
  setAllowed: jest.fn(),
  signTransaction: jest.fn(),
  getNetworkDetails: jest.fn(),
}))

const mockPublicKey = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
const mockNetwork = testnet as NetworkConfig

const mockFreighterGetPublicKey = (): void => {
  ;(freighterApi.getPublicKey as jest.MockedFunction<typeof freighterApi.getPublicKey>).mockResolvedValue(mockPublicKey)
}

const mockFreighterIsConnected = (): void => {
  ;(freighterApi.isConnected as jest.MockedFunction<typeof freighterApi.isConnected>).mockResolvedValue(true)
}

const mockFreighterIsAllowed = (): void => {
  ;(freighterApi.isAllowed as jest.MockedFunction<typeof freighterApi.isAllowed>).mockResolvedValue(true)
}
const mockFreighterGetNetworkDetailsTestnet = (): void => {
  ;(freighterApi.getNetworkDetails as jest.Mock).mockResolvedValue({ networkPassphrase: testnet.networkPassphrase })
}

const mockFreighterGetNetworkDetailsWrongNetwork = (): void => {
  ;(freighterApi.getNetworkDetails as jest.Mock).mockResolvedValue({ networkPassphrase: 'wrong network' })
}

const mockSuccessfullyConnectedFreighter = (): void => {
  mockFreighterIsAllowed()
  mockFreighterIsConnected()
  mockFreighterGetNetworkDetailsTestnet()
  mockFreighterGetPublicKey()
}

describe('FreighterAccountHandlerClient', () => {
  let client: FreighterAccountHandlerClient

  beforeEach(() => {
    client = new FreighterAccountHandlerClient({ networkConfig: mockNetwork })
  })

  it('should initialize with provided network', () => {
    expect(client).toBeDefined()
  })

  it('should directly load and set the public key', async () => {
    mockSuccessfullyConnectedFreighter()
    await client.loadPublicKey()
    expect(client.getPublicKey()).toBe(mockPublicKey)
  })

  it('should directly load and set the public key when connecting', async () => {
    mockSuccessfullyConnectedFreighter()
    await client.connect()
    expect(client.getPublicKey()).toBe(mockPublicKey)
  })

  it('should connect to Freighter', async () => {
    await expect(client.connect()).resolves.not.toThrow()
  })

  it('should disconnect', async () => {
    mockSuccessfullyConnectedFreighter()
    await client.disconnect()
    expect(client.getPublicKey()).toBe('')
  })

  it('should sign a transaction', async () => {
    const mockTransaction = mockUnsignedClassicTransaction
    ;(freighterApi.signTransaction as jest.MockedFunction<typeof freighterApi.signTransaction>).mockResolvedValue(
      mockSignedClassicTransactionXdr
    )
    await expect(client.sign(mockTransaction)).resolves.toEqual(mockSignedClassicTransactionXdr)
  })

  it('should validate network', async () => {
    mockFreighterGetNetworkDetailsTestnet
    await expect(client.isNetworkCorrect()).resolves.toBeTruthy()
  })

  it('should validate wrong network', async () => {
    mockFreighterGetNetworkDetailsWrongNetwork()
    await expect(client.isNetworkCorrect()).rejects.toThrow()
  })
})
