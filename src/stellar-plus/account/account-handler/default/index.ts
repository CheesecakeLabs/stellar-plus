import {
  ClassicFeeBumpTransaction,
  ClassicTransaction,
  Keypair,
  Network,
  SorobanFeeBumpTransaction,
  SorobanKeypair,
  SorobanTransaction,
  Transaction,
  TransactionXdr,
} from "../../../types";
import { AccountBaseClient } from "../../base";
import { DefaultAccountHandler, DefaultAccountHandlerPayload } from "./types";
import { Keypair as ClassicKeypair } from "stellar-sdk";

export class DefaultAccountHandlerClient
  extends AccountBaseClient
  implements DefaultAccountHandler
{
  private secretKey: string;

  constructor(payload: DefaultAccountHandlerPayload) {
    const { secretKey } = payload;
    const keypair = secretKey
      ? ClassicKeypair.fromSecret(secretKey)
      : ClassicKeypair.random();

    const publicKey = keypair.publicKey();
    super({ ...payload, publicKey });

    this.secretKey = keypair.secret();
  }

  public getPublicKey(): string {
    return ClassicKeypair.fromSecret(this.secretKey).publicKey();
  }

  public sign(tx: Transaction): TransactionXdr {
    if (
      tx instanceof SorobanTransaction ||
      tx instanceof SorobanFeeBumpTransaction
    ) {
      const keypair = SorobanKeypair.fromSecret(this.secretKey);
      tx.sign(keypair);
      return tx.toXDR() as TransactionXdr;
    }
    if (
      tx instanceof ClassicTransaction ||
      tx instanceof ClassicFeeBumpTransaction
    ) {
      const keypair = ClassicKeypair.fromSecret(this.secretKey);
      tx.sign(keypair);
      return tx.toXDR() as TransactionXdr;
    }

    throw new Error("Unsupported transaction type");
  }
}
