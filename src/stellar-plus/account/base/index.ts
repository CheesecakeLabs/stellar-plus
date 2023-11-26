import { AccountHelpers } from "../helpers";
import { AccountBase, AccountBasePayload } from "./types";

export class AccountBaseClient extends AccountHelpers implements AccountBase {
  publicKey: string;
  constructor(payload: AccountBasePayload) {
    const { publicKey } = payload;
    super(payload);

    this.publicKey = publicKey;
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}
