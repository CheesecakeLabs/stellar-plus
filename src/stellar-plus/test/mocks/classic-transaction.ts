import { Account, Keypair, Operation, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

import { TransactionInvocation } from 'stellar-plus/core/types'
import { mockedStellarAccount } from 'stellar-plus/test/mocks/accounts'
import { ACCOUNT_A_SK, NETWORK_PASSPHRASE } from 'stellar-plus/test/mocks/constants'

// ==============================
// simple classic transactions
// ==============================

const sourceAccount = mockedStellarAccount as Account

const unsignedClassicTransaction = new TransactionBuilder(sourceAccount, {
  fee: '100',
  networkPassphrase: NETWORK_PASSPHRASE,
})
  .addOperation(
    Operation.setOptions({
      homeDomain: 'cake.com', // Set the home domain to 'cake.com'
    })
  )
  .setTimeout(0)
  .build()

const unsignedClassicTransactionXdr = unsignedClassicTransaction.toXDR()

const signingKeypair = Keypair.fromSecret(ACCOUNT_A_SK)

const signedClassicTransaction = TransactionBuilder.cloneFrom(unsignedClassicTransaction).build()
signedClassicTransaction.sign(signingKeypair)

const signedClassicTransactionXdr = signedClassicTransaction.toXDR()

export {
  unsignedClassicTransaction as mockUnsignedClassicTransaction,
  unsignedClassicTransactionXdr as mockUnsignedClassicTransactionXdr,
  signedClassicTransaction as mockSignedClassicTransaction,
  signedClassicTransactionXdr as mockSignedClassicTransactionXdr,
}

// ==============================

// ==============================
// Classic Transaction Processor
// ==============================

export type MockTransactionProcessorType = {
  processTransaction: () => Promise<HorizonApi.SubmitTransactionResponse>
  buildCustomTransaction: (
    operations: Operation[],
    txInvocation: TransactionInvocation
  ) => Promise<{ builtTx: Transaction; updatedTxInvocation: TransactionInvocation }>
}

export class mockClassicTransactionProcessor implements MockTransactionProcessorType {
  public processTransaction = jest.fn().mockImplementation((): Promise<HorizonApi.SubmitTransactionResponse> => {
    return Promise.resolve(mockHorizonApiSubmitTransactionResponse())
  })

  public buildCustomTransaction = jest
    .fn()
    .mockImplementation(
      (
        operations: Operation[],
        txInvocation: TransactionInvocation
      ): Promise<{ builtTx: Transaction; updatedTxInvocation: TransactionInvocation }> => {
        console.log('mocking buildCustomTransaction')
        return Promise.resolve({ builtTx: unsignedClassicTransaction, updatedTxInvocation: txInvocation })
      }
    )
}

export const mockHorizonApiSubmitTransactionResponse = (): HorizonApi.SubmitTransactionResponse => {
  return {
    hash: 'mock hash',
    ledger: 12345,
    successful: true,
    envelope_xdr: 'mock envelope xdr',
    result_xdr: 'mock result xdr',
    result_meta_xdr: 'mock result meta xdr',
    paging_token: 'mock paging token',
  }
}
