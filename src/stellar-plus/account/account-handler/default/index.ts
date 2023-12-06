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
   * @param payload - The payload for the account handler. If no secret key is provided, a random keypair will be generated. Additional parameters may be provided to enable different helpers.
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
   * @returns The public key of the account.
   */
  public getPublicKey(): string {
    return ClassicKeypair.fromSecret(this.secretKey).publicKey()
  }

  /**
   *
   * @param tx - The transaction to sign.
   * @returns The signed transaction in xdr format.
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
