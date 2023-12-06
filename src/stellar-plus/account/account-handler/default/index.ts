import { Keypair as ClassicKeypair } from 'stellar-sdk'

import { DefaultAccountHandler, DefaultAccountHandlerPayload } from '@account/account-handler/default/types'
import { AccountBaseClient } from '@account/base'
import {
  ClassicFeeBumpTransaction,
  ClassicTransaction,
  SorobanFeeBumpTransaction,
  SorobanKeypair,
  SorobanTransaction,
  Transaction,
  TransactionXdr,
} from '@stellar-plus/types'

export class DefaultAccountHandlerClient extends AccountBaseClient implements DefaultAccountHandler {
  public secretKey: string

  /**
   *
   * @args  payload - The payload for the account handler. Additional parameters may be provided to enable different helpers.
   * @param {string=} payload.secretKey The secret key of the account. If not provided, a new random account will be created.
   * @param {Network} payload.network The network to use.
   * @description - The default account handler is used for handling and creating new accounts by directly manipulating the secret key.
   */
  constructor(payload: DefaultAccountHandlerPayload) {
    const secretKey = payload.secretKey as string
    const keypair = secretKey ? ClassicKeypair.fromSecret(secretKey) : ClassicKeypair.random()

    const publicKey = keypair.publicKey()
    super({ ...payload, publicKey })

    this.secretKey = keypair.secret()
  }

  /**
   *
   * @returns {string} The public key of the account.
   */
  public getPublicKey(): string {
    return ClassicKeypair.fromSecret(this.secretKey).publicKey()
  }

  /**
   *
   * @param {Transaction} tx - The transaction to sign.
   *
   * @description - Signs the given transaction with the account's secret key.
   *
   * @returns {TransactionXdr} The signed transaction in xdr format.
   */
  public sign(tx: Transaction): TransactionXdr {
    if (tx instanceof SorobanTransaction || tx instanceof SorobanFeeBumpTransaction) {
      const keypair = SorobanKeypair.fromSecret(this.secretKey)
      tx.sign(keypair)
      return tx.toXDR() as TransactionXdr
    }
    if (tx instanceof ClassicTransaction || tx instanceof ClassicFeeBumpTransaction) {
      const keypair = ClassicKeypair.fromSecret(this.secretKey)
      tx.sign(keypair)
      return tx.toXDR() as TransactionXdr
    }

    throw new Error('Unsupported transaction type')
  }
}
