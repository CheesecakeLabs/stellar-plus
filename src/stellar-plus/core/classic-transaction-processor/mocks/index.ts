import { Transaction, xdr as xdrNamespace } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { TransactionInvocation } from 'stellar-plus/core/types'
import { mockUnsignedClassicTransaction } from 'stellar-plus/test/mocks/classic-transaction'

export default class MockTransactionProcessor {
  public processTransaction = jest.fn(async (): Promise<HorizonApi.SubmitTransactionResponse> => {
    return Promise.resolve({
      hash: 'mock hash',
      ledger: 12345,
      successful: true,
      envelope_xdr: 'mock envelope xdr',
      result_xdr: 'mock result xdr',
      result_meta_xdr: 'mock result meta xdr',
      paging_token: 'mock paging token',
    })
  })

  public buildCustomTransaction = jest.fn(
    async (
      operations: xdrNamespace.Operation[],
      txInvocation: TransactionInvocation
    ): Promise<{
      builtTx: Transaction
      updatedTxInvocation: TransactionInvocation
    }> => {
      return Promise.resolve({
        builtTx: mockUnsignedClassicTransaction as Transaction,
        updatedTxInvocation: txInvocation,
      })
    }
  )
}
