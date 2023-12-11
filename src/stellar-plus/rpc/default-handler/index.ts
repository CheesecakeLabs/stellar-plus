import { Server, SorobanRpc } from 'soroban-client'

import { RpcHandler } from '@rpc/types'
import { Network, SorobanFeeBumpTransaction, SorobanTransaction } from '@stellar-plus/types'

export class DefaultRpcHandler implements RpcHandler {
  private server: Server
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
    this.server = new Server(this.network.rpcUrl)
  }

  /**
   *
   * @param {string} txHash - The transaction hash to get.
   *
   * @returns {SorobanRpc.GetTransactionResponse} The transaction response from the Soroban server.
   *
   * @description - Gets the transaction from the Soroban server.
   */
  async getTransaction(txHash: string): Promise<SorobanRpc.GetTransactionResponse> {
    const response = await this.server.getTransaction(txHash)
    return response
  }

  /**
   *
   * @param {SorobanTransaction} tx - The transaction to simulate.
   *
   * @returns {SorobanRpc.SimulateTransactionResponse} The transaction simulation response from the Soroban server.
   *
   * @description - Simulates the transaction on the Soroban server.
   */
  async simulateTransaction(tx: SorobanTransaction): Promise<SorobanRpc.SimulateTransactionResponse> {
    const response = await this.server.simulateTransaction(tx)
    return response
  }

  /**
   *
   * @param {SorobanTransaction} tx - The transaction to prepare.
   *
   * @returns {SorobanTransaction} The prepared transaction.
   *
   * @description - Prepares the transaction on the Soroban server.
   */
  async prepareTransaction(tx: SorobanTransaction): Promise<SorobanTransaction> {
    const response = await this.server.prepareTransaction(tx)
    return response as SorobanTransaction
  }

  /**
   *
   * @param {SorobanTransaction | SorobanFeeBumpTransaction} tx - The transaction to submit.
   *
   * @returns {SorobanRpc.SendTransactionResponse} The transaction submission response from the Soroban server.
   *
   * @description - Submits the transaction on the Soroban server.
   */
  async submitTransaction(
    tx: SorobanTransaction | SorobanFeeBumpTransaction
  ): Promise<SorobanRpc.SendTransactionResponse> {
    const response = await this.server.sendTransaction(tx)
    return response
  }
}
