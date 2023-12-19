import { FeeBumpTransaction, SorobanRpc, Transaction } from '@stellar/stellar-sdk'

export type RpcHandler = {
  getTransaction(txHash: string): Promise<SorobanRpc.Api.GetTransactionResponse>
  simulateTransaction(tx: Transaction): Promise<SorobanRpc.Api.SimulateTransactionResponse>
  _simulateTransaction?(tx: Transaction): Promise<SorobanRpc.Api.RawSimulateTransactionResponse>
  prepareTransaction(tx: Transaction): Promise<Transaction>
  submitTransaction(tx: Transaction | FeeBumpTransaction): Promise<SorobanRpc.Api.SendTransactionResponse>
}
