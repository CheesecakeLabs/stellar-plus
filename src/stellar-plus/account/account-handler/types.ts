import { Transaction, TransactionXdr } from "../../types";
import { AccountBase } from "../base/types";
import { AccountHelpersPayload } from "../helpers/types";

export type AccountHandler = AccountBase & {
  sign(tx: Transaction): Promise<TransactionXdr> | TransactionXdr;
};

export type AccountHandlerPayload = AccountHelpersPayload & {};
