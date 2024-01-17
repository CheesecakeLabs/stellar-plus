import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountBaseClient } from 'stellar-plus/account/base'
import { TransactionXdr } from 'stellar-plus/types'

import { CAHError } from './errors'
import { CustomAccountHandler, CustomAccountHandlerPayload } from './types'

export class CustomAccountHandlerClient extends AccountBaseClient implements CustomAccountHandler {
  protected customSign: (tx: Transaction | FeeBumpTransaction, publicKey: string) => Promise<TransactionXdr>
  protected publicKey: string

  /**
   *
   * @args  payload - The payload for the account handler. Additional parameters may be provided to enable different helpers.
   * @param {string=} payload.publicKey The public key of the account.
   * @param {function=} payload.customSign The function to sign the transaction.
   * @param {Network} payload.network The network to use.
   * @description - The custom account handler is used to handle external signatures.
   */
  constructor(payload: CustomAccountHandlerPayload) {
    const customSign = payload.customSign as (tx: Transaction | FeeBumpTransaction, publicKey: string) => Promise<TransactionXdr>
    const publicKey = payload.publicKey as string
    try {
      super({...payload})
      this.customSign = customSign
      this.publicKey = publicKey
    } catch (e) {
      throw CAHError.failedToLoadPublicKeyError(e as Error)
    }
  }

  /**
   *
   * @returns {string} The public key of the account.
   */
  public getPublicKey(): string {
    try {
      return this.publicKey
    } catch (e) {
      throw CAHError.failedToLoadPublicKeyError(e as Error)
    }
  }

  /**
   *
   * @param {Transaction} tx - The transaction to sign.
   *
   * @description - Signs the given transaction with the external signature function.
   *
   * @returns {TransactionXdr} The signed transaction in xdr format.
   */
  public async sign(tx: Transaction | FeeBumpTransaction): Promise<TransactionXdr> {
    try {
      return await this.customSign(tx, this.publicKey) as TransactionXdr;
    } catch (e) {
      throw CAHError.failedToSignTransactionError(e as Error);
    }
  }
}
