import { AccountBase, AccountBasePayload } from 'stellar-plus/account/base/types'
import { AccountHelpers } from 'stellar-plus/account/helpers'

export class AccountBaseClient extends AccountHelpers implements AccountBase {
  protected publicKey: string

  /**
   *
   * @args {} payload - The payload for the account. Additional parameters may be provided to enable different helpers.
   * @param {string} payload.publicKey The public key of the account.
   * @param {NetworkConfig=} payload.networkConfig The network config for the target network.
   *
   * @description - The base account is used for handling accounts with no management actions.
   */
  constructor(payload: AccountBasePayload) {
    super(payload)
    const { publicKey } = payload as { publicKey: string }

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
