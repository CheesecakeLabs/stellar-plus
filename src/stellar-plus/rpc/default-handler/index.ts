import { FeeBumpTransaction, rpc as SorobanRpc, Transaction, xdr } from '@stellar/stellar-sdk'

import { DRHError } from 'stellar-plus/rpc/default-handler/errors'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { NetworkConfig } from 'stellar-plus/types'

export class DefaultRpcHandler implements RpcHandler {
  readonly type = 'RpcHandler'
  private server: SorobanRpc.Server
  private networkConfig: NetworkConfig

  /**
   *
   * @param {NetworkConfig} networkConfig - The network to use.
   *
   * @description - The default rpc handler is used for interacting with the Soroban server.
   * It uses the URL provided by the network to connect to the Soroban server and carry out the RPC functions.
   *
   */
  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig

    if (!this.networkConfig.rpcUrl) {
      throw DRHError.missingRpcUrl()
    }

    const serverOpts = networkConfig.allowHttp ? { allowHttp: true } : {}

    this.server = new SorobanRpc.Server(this.networkConfig.rpcUrl, serverOpts)
  }

  /**
   *
   * @param {string} txHash - The transaction hash to get.
   *
   * @returns {SorobanRpc.GetTransactionResponse} The transaction response from the Soroban server.
   *
   * @description - Gets the transaction from the Soroban server.
   */
  async getTransaction(txHash: string): Promise<SorobanRpc.Api.GetTransactionResponse> {
    const response = await this.server.getTransaction(txHash)
    return response
  }

  /**
   *
   * @param {Transaction} tx - The transaction to simulate.
   *
   * @returns {SorobanRpc.SimulateTransactionResponse} The transaction simulation response from the Soroban server.
   *
   * @description - Simulates the transaction on the Soroban server.
   */
  async simulateTransaction(tx: Transaction | FeeBumpTransaction): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
    const response = await this.server.simulateTransaction(tx)
    return response
  }

  /**
   *
   * @param {Transaction} tx - The transaction to prepare.
   *
   * @returns {Transaction} The prepared transaction.
   *
   * @description - Prepares the transaction on the Soroban server.
   */
  async prepareTransaction(tx: Transaction): Promise<Transaction> {
    const response = await this.server.prepareTransaction(tx)
    return response as Transaction
  }

  /**
   *
   * @param {Transaction | SorobanFeeBumpTransaction} tx - The transaction to submit.
   *
   * @returns {SorobanRpc.SendTransactionResponse} The transaction submission response from the Soroban server.
   *
   * @description - Submits the transaction on the Soroban server.
   */
  async submitTransaction(tx: Transaction | FeeBumpTransaction): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const response = await this.server.sendTransaction(tx)
    return response
  }

  /**
   * @returns {Promise<SorobanRpc.GetLatestLedgerResponse>} The latest ledger response from the Soroban server.
   * @description - Gets the latest ledger from the Soroban RPC server.
   * */
  async getLatestLedger(): Promise<SorobanRpc.Api.GetLatestLedgerResponse> {
    return await this.server.getLatestLedger()
  }

  /**
   * @returns {Promise<SorobanRpc.GetHealthResponse>} The health response from the Soroban server.
   * @description - Gets the health of the Soroban RPC server.
   * */
  async getHealth(): Promise<SorobanRpc.Api.GetHealthResponse> {
    return await this.server.getHealth()
  }

  /**
   * @returns {Promise<SorobanRpc.GetNetworkResponse>} The network response from the Soroban server.
   * @description - Gets the network of the Soroban RPC server.
   * */
  async getNetwork(): Promise<SorobanRpc.Api.GetNetworkResponse> {
    return await this.server.getNetwork()
  }

  /**
   *
   * @args {SorobanRpc.GetEventsRequest} request - The events request to get.
   * @args {Api.EventFilter[]} request.filters - The filters to apply to the events.
   * @args {number} request.startLedger - The start ledger to get the events from.
   * @args {string} request.cursor - The cursor to get the events from.
   * @args {number} request.limit - The limit of events to get.
   *
   *
   * @returns {SorobanRpc.GetEventsResponse} The events response from the Soroban server.
   *
   * @description - Gets the events from the Soroban server.
   */
  async getEvents(request: SorobanRpc.Server.GetEventsRequest): Promise<SorobanRpc.Api.GetEventsResponse> {
    return await this.server.getEvents(request)
  }

  /**
   *
   * @param {xdr.LedgerKey[]} keys - The keys to get the ledger entries for.
   *
   * @returns {SorobanRpc.GetLedgerEntriesResponse} The ledger entries response from the Soroban server.
   *
   * @description - Gets the ledger entries from the Soroban server.
   */
  async getLedgerEntries(...keys: xdr.LedgerKey[]): Promise<SorobanRpc.Api.GetLedgerEntriesResponse> {
    return await this.server.getLedgerEntries(...keys)
  }
}
