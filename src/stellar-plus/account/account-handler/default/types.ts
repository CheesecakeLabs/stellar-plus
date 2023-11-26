import { Network, Transaction, TransactionXdr } from "../../../types";
import { AccountHandler, AccountHandlerPayload } from "../types";

export type DefaultAccountHandler = AccountHandler & {
  sign(tx: Transaction): TransactionXdr;
};

//
// When the secret key is not provided, a random keypair is generated.
//
export type DefaultAccountHandlerPayload = AccountHandlerPayload & {
  secretKey?: string;
};
