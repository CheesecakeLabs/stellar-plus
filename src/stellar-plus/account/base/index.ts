import { AccountBase, AccountBasePayload } from '@account/base/types'
import { AccountHelpers } from '@account/helpers'

export class AccountBaseClient extends AccountHelpers implements AccountBase {
  publicKey: string
  constructor(payload: AccountBasePayload) {
    const { publicKey } = payload as { publicKey: string }
    super(payload)

    this.publicKey = publicKey
  }

  getPublicKey(): string {
    return this.publicKey
  }
}
