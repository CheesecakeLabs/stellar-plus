import { FeeBumpTransaction, SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network } from 'stellar-plus/types'

export class DefaultRpcHandler implements RpcHandler {
  private server: SorobanRpc.Server
  private network: Network

  /**
   *
   * @param {Network} network - The network to use.
   *
   * @description - The default rpc handler is used for interacting with the Soroban server.
   * It uses the URL provided by the network to connect to the Soroban server and carry out the RPC functions.
   *
   */
  constructor(network: Network) {
    this.network = network
    this.server = new SorobanRpc.Server(this.network.rpcUrl)
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
  async simulateTransaction(tx: Transaction): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
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
}
