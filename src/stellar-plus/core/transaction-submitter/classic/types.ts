import { Horizon as HorizonNamespace, TransactionBuilder } from '@stellar/stellar-sdk'

import { TransactionInvocation } from '@core/types'
import { Transaction } from '@stellar-plus/types'

export type TransactionSubmitter = {
  createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder
    updatedTxInvocation: TransactionInvocation
  }>
  submit(envelope: Transaction): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse>
  postProcessTransaction(
    response: HorizonNamespace.HorizonApi.SubmitTransactionResponse
  ): HorizonNamespace.HorizonApi.SubmitTransactionResponse
}
