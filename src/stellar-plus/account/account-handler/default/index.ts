import { FeeBumpTransaction, Keypair, Transaction } from '@stellar/stellar-sdk'

import { DefaultAccountHandler, DefaultAccountHandlerPayload } from 'stellar-plus/account/account-handler/default/types'
import { AccountBaseClient } from 'stellar-plus/account/base'
import { TransactionXdr } from 'stellar-plus/types'

import { DAHError } from './errors'

export class DefaultAccountHandlerClient extends AccountBaseClient implements DefaultAccountHandler {
  protected secretKey: string

  /**
   *
   * @args  payload - The payload for the account handler. Additional parameters may be provided to enable different helpers.
   * @param {string=} payload.secretKey The secret key of the account. If not provided, a new random account will be created.
   * @param {NetworkConfig} payload.networkConfig The network to use.
   * @description - The default account handler is used for handling and creating new accounts by directly manipulating the secret key.
   */
  constructor(payload: DefaultAccountHandlerPayload) {
    const secretKey = payload.secretKey as string
    try {
      const keypair = secretKey ? Keypair.fromSecret(secretKey) : Keypair.random()

      const publicKey = keypair.publicKey()
      super({ ...payload, publicKey })

      this.secretKey = keypair.secret()
    } catch (e) {
      throw DAHError.failedToLoadSecretKeyError(e as Error)
    }
  }

  /**
   *
   * @returns {string} The public key of the account.
   */
  public getPublicKey(): string {
    try {
      return Keypair.fromSecret(this.secretKey).publicKey()
    } catch (e) {
      throw DAHError.failedToLoadSecretKeyError(e as Error)
    }
  }

  /**
   *
   * @param {Transaction} tx - The transaction to sign.
   *
   * @description - Signs the given transaction with the account's secret key.
   *
   * @returns {TransactionXdr} The signed transaction in xdr format.
   */
  public sign(tx: Transaction | FeeBumpTransaction): TransactionXdr {
    try {
      const keypair = Keypair.fromSecret(this.secretKey)
      tx.sign(keypair)

      return tx.toXDR() as TransactionXdr
    } catch (e) {
      throw DAHError.failedToSignTransactionError(e as Error)
    }
  }
}
