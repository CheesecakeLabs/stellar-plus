import { Account, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk'

import { ACCOUNT_A_SK, NETWORK_PASSPHRASE } from 'stellar-plus/test/mocks/constants'

import { mockedStellarAccount } from './stellar-account'

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
