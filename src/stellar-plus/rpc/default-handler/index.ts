import { Server, SorobanRpc } from 'soroban-client'

import { RpcHandler } from '@rpc/types'
import { Network, SorobanFeeBumpTransaction, SorobanTransaction } from '@stellar-plus/types'

export class DefaultRpcHandler implements RpcHandler {
  private server: Server
  private network: Network
  constructor(network: Network) {
    this.network = network
    this.server = new Server(this.network.rpcUrl)
  }

  async getTransaction(txHash: string): Promise<SorobanRpc.GetTransactionResponse> {
    const response = await this.server.getTransaction(txHash)
    return response
  }

  async simulateTransaction(tx: SorobanTransaction): Promise<SorobanRpc.SimulateTransactionResponse> {
    const response = await this.server.simulateTransaction(tx)
    return response
  }

  async prepareTransaction(tx: SorobanTransaction): Promise<SorobanTransaction> {
    const response = await this.server.prepareTransaction(tx)
    return response as SorobanTransaction
  }

  async submitTransaction(
    tx: SorobanTransaction | SorobanFeeBumpTransaction
  ): Promise<SorobanRpc.SendTransactionResponse> {
    const response = await this.server.sendTransaction(tx)
    return response
  }
}
