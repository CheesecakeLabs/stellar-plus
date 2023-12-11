import {
  FeeBumpTransaction,
  Horizon as HorizonNamespace,
  // SorobanRpc as SorobanRpcNamespace,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk'

import { TransactionInvocation } from '@core/types'

export type TransactionSubmitter = {
  createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder
    updatedTxInvocation: TransactionInvocation
  }>
  submit(envelope: Transaction | FeeBumpTransaction): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse>
  postProcessTransaction(
    response: HorizonNamespace.HorizonApi.SubmitTransactionResponse
  ): HorizonNamespace.HorizonApi.SubmitTransactionResponse
}
