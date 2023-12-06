import { AccountBase, AccountBasePayload } from '@account/base/types'
import { AccountHelpers } from '@account/helpers'

export class AccountBaseClient extends AccountHelpers implements AccountBase {
  publicKey: string

  /**
   *
   * @args {} payload - The payload for the account. Additional parameters may be provided to enable different helpers.
   * @param {string} payload.publicKey The public key of the account.
   * @param {Network=} payload.network The network to use.
   *
   * @description - The base account is used for handling accounts with no management actions.
   */
  constructor(payload: AccountBasePayload) {
    const { publicKey } = payload as { publicKey: string }
    super(payload)

    this.publicKey = publicKey
  }

  /**
   *
   * @returns {string} The public key of the account.
   *
   */
  getPublicKey(): string {
    return this.publicKey
  }
}
