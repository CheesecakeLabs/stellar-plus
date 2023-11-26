import { SorobanRpcServer } from "../types";
import { AccountResponse } from "stellar-sdk";

export type SorobanHandler = {
  server: SorobanRpcServer;
};
