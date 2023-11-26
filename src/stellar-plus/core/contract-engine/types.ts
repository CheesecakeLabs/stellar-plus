import { AccountHandler } from "../../account/account-handler/types";
import { EnvelopeHeader, FeeBumpHeader } from "../types";

export type SorobanInvokeArgs<T> = SorobanSimulateArgs<T> & {
  signers: AccountHandler[];
  feeBump?: FeeBumpHeader;
};

export type SorobanSimulateArgs<T> = {
  method: string;
  methodArgs: T;
  header: EnvelopeHeader;
};
