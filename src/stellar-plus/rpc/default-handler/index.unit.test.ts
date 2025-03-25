/* eslint-disable @typescript-eslint/no-explicit-any */
import { rpc as SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { CustomNet, TestNet } from 'stellar-plus/network'
import { DRHError } from 'stellar-plus/rpc/default-handler/errors'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler/index'

const NETWORK_CONFIG = TestNet()

describe('Default RPC Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('constructor', () => {
    it('should throw an error if the network configuration is missing the RPC URL', () => {
      const netWorkConfigWithoutRpcUrl = CustomNet({ ...NETWORK_CONFIG, rpcUrl: undefined })

      expect(() => new DefaultRpcHandler(netWorkConfigWithoutRpcUrl)).toThrow(DRHError.missingRpcUrl())
    })

    it('should create a new Soroban server instance', () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)

      expect(rpcHandler).toBeDefined()
      expect((rpcHandler as any).server).toBeDefined()
    })

    it('should create a new Soroban server instance with allowHttp option when enabled in the network', () => {
      const networkConfigWithHttp = CustomNet({ ...NETWORK_CONFIG, allowHttp: true })
      const rpcHandler = new DefaultRpcHandler(networkConfigWithHttp)

      expect(rpcHandler).toBeDefined()
      expect((rpcHandler as any).server).toBeDefined()
    })
  })

  describe('getTransaction', () => {
    it('should return the transaction response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getTransaction = jest.fn().mockResolvedValue({ id: 'mock_transaction' })

      const response = await rpcHandler.getTransaction('mock_transaction')

      expect(response).toEqual({ id: 'mock_transaction' })
    })
  })

  describe('simulateTransaction', () => {
    it('should return the transaction simulation response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.simulateTransaction = jest.fn().mockResolvedValue({ id: 'mock_simulation' })

      const response = await rpcHandler.simulateTransaction(jest.fn() as unknown as Transaction)

      expect(response).toEqual({ id: 'mock_simulation' })
    })
  })

  describe('prepareTransaction', () => {
    it('should return the transaction preparation response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.prepareTransaction = jest.fn().mockResolvedValue({ id: 'mock_preparation' })

      const response = await rpcHandler.prepareTransaction(jest.fn() as unknown as Transaction)

      expect(response).toEqual({ id: 'mock_preparation' })
    })
  })

  describe('submitTransaction', () => {
    it('should return the transaction submission response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.sendTransaction = jest.fn().mockResolvedValue({ id: 'mock_submission' })

      const response = await rpcHandler.submitTransaction(jest.fn() as unknown as Transaction)

      expect(response).toEqual({ id: 'mock_submission' })
    })
  })

  describe('getLatestLedger', () => {
    it('should return the latest ledger response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getLatestLedger = jest.fn().mockResolvedValue({ id: 'mock_ledger' })

      const response = await rpcHandler.getLatestLedger()

      expect(response).toEqual({ id: 'mock_ledger' })
    })
  })

  describe('getHealth', () => {
    it('should return the health response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getHealth = jest.fn().mockResolvedValue({ id: 'mock_health' })

      const response = await rpcHandler.getHealth()

      expect(response).toEqual({ id: 'mock_health' })
    })
  })

  describe('getNetwork', () => {
    it('should return the network response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getNetwork = jest.fn().mockResolvedValue({ id: 'mock_network' })

      const response = await rpcHandler.getNetwork()

      expect(response).toEqual({ id: 'mock_network' })
    })
  })

  describe('getEvents', () => {
    it('should return the events response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getEvents = jest.fn().mockResolvedValue({ id: 'mock_events' })

      const response = await rpcHandler.getEvents(jest.fn() as unknown as SorobanRpc.Server.GetEventsRequest)

      expect(response).toEqual({ id: 'mock_events' })
    })
  })

  describe('getLedgerEntries', () => {
    it('should return the ledger entries response from Soroban', async () => {
      const rpcHandler = new DefaultRpcHandler(NETWORK_CONFIG)
      ;(rpcHandler as any).server.getLedgerEntries = jest.fn().mockResolvedValue({ id: 'mock_ledger_entries' })

      const response = await rpcHandler.getLedgerEntries()

      expect(response).toEqual({ id: 'mock_ledger_entries' })
    })
  })
})
