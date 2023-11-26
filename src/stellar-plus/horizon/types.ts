import { HorizonServer } from "../types";
import { AccountResponse } from "stellar-sdk";

export type HorizonHandler = {
  server: HorizonServer;
  loadAccount(accountId: string): Promise<AccountResponse>;
};
