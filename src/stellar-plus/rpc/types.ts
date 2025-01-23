import { FeeBumpTransaction, rpc as SorobanRpc, Transaction, xdr } from '@stellar/stellar-sdk'

export type RpcHandler = {
  readonly type: 'RpcHandler'
  getTransaction(txHash: string): Promise<SorobanRpc.Api.GetTransactionResponse>
  getLatestLedger(): Promise<SorobanRpc.Api.GetLatestLedgerResponse>
  getHealth(): Promise<SorobanRpc.Api.GetHealthResponse>
  getNetwork(): Promise<SorobanRpc.Api.GetNetworkResponse>
  getEvents(request: SorobanRpc.Server.GetEventsRequest): Promise<SorobanRpc.Api.GetEventsResponse>
  getLedgerEntries(...keys: xdr.LedgerKey[]): Promise<SorobanRpc.Api.GetLedgerEntriesResponse>
  simulateTransaction(tx: Transaction): Promise<SorobanRpc.Api.SimulateTransactionResponse>
  prepareTransaction(tx: Transaction): Promise<Transaction>
  submitTransaction(tx: Transaction | FeeBumpTransaction): Promise<SorobanRpc.Api.SendTransactionResponse>
}
