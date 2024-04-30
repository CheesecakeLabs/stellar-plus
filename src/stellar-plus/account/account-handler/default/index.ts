import { FeeBumpTransaction, Keypair, Transaction, authorizeEntry, xdr } from '@stellar/stellar-sdk'

import { DAHError } from 'stellar-plus/account/account-handler/default/errors'
import { DefaultAccountHandler, DefaultAccountHandlerPayload } from 'stellar-plus/account/account-handler/default/types'
import { AccountBase } from 'stellar-plus/account/base'
import { TransactionXdr } from 'stellar-plus/types'

/**
 * @class DefaultAccountHandlerClient
 * @extends AccountBase
 * @implements DefaultAccountHandler
 * @description - The default account handler is used for handling and creating new accounts by directly manipulating the secret key. Avoid using this handler in production environments.
 */

export class DefaultAccountHandlerClient extends AccountBase implements DefaultAccountHandler {
  protected secretKey: string

  /**
   *
   * @args  payload - The payload for the account handler. Additional parameters may be provided to enable different helpers.
   * @param {string=} payload.secretKey The secret key of the account. If not provided, a new random account will be created.
   * @param {NetworkConfig} payload.networkConfig The network to use.
   * @description - The default account handler is used for handling and creating new accounts by directly manipulating the secret key.
   */
  constructor(payload?: DefaultAccountHandlerPayload) {
    const secretKey = payload?.secretKey as string
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
   * @description - Returns the secret key of the account.
   *
   * @returns {string} The secret key of the account.
   */
  public getSecretKey(): string {
    return this.secretKey
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

  /**
   *
   * @param {xdr.SorobanAuthorizationEntry} entry - The soroban authorization entry to sign.
   * @param {number} validUntilLedgerSeq - The ledger sequence number until which the entry signature is valid.
   * @param {string} networkPassphrase - The network passphrase.
   *
   * @description - Signs the given Soroban authorization entry with the account's secret key.
   *
   * @returns {xdr.SorobanAuthorizationEntry} The signed entry.
   */
  public async signSorobanAuthEntry(
    entry: xdr.SorobanAuthorizationEntry,
    validUntilLedgerSeq: number,
    networkPassphrase: string
  ): Promise<xdr.SorobanAuthorizationEntry> {
    try {
      const keypair = Keypair.fromSecret(this.secretKey)
      const signedEntry = await authorizeEntry(entry, keypair, validUntilLedgerSeq, networkPassphrase) // Passphrase is necessary! Cannot be removed!

      return signedEntry
    } catch (e) {
      throw DAHError.failedToSignAuthorizationEntryError(
        e as Error,
        entry.toXDR('base64'),
        validUntilLedgerSeq,
        networkPassphrase
      )
    }
  }
}
