import { TransactionBuilder } from 'stellar-base'
import { Horizon as HorizonNamespace } from 'stellar-sdk'

import { TransactionInvocation } from '@core/types'
import { Transaction } from '@stellar-plus/types'

export type TransactionSubmitter = {
  createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder
    updatedTxInvocation: TransactionInvocation
  }>
  submit(envelope: Transaction): Promise<HorizonNamespace.SubmitTransactionResponse>
  postProcessTransaction(
    response: HorizonNamespace.SubmitTransactionResponse
  ): HorizonNamespace.SubmitTransactionResponse
}
