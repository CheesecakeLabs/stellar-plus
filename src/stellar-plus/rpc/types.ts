import { SorobanRpc } from 'soroban-client'

import { SorobanFeeBumpTransaction, SorobanTransaction } from '@stellar-plus/types'

export type RpcHandler = {
  getTransaction(txHash: string): Promise<SorobanRpc.GetTransactionResponse>
  simulateTransaction(tx: SorobanTransaction): Promise<SorobanRpc.SimulateTransactionResponse>
  prepareTransaction(tx: SorobanTransaction): Promise<SorobanTransaction>
  submitTransaction(tx: SorobanTransaction | SorobanFeeBumpTransaction): Promise<SorobanRpc.SendTransactionResponse>
}
