import {
  Transaction as SorobanTransaction,
  FeeBumpTransaction as SorobanFeeBumpTransaction,
  Keypair as SorobanKeypair,
  Server as SorobanRpcServer,
  Address as SorobanAddress,
} from "soroban-client";
import {
  Transaction as ClassicTransaction,
  FeeBumpTransaction as ClassicFeeBumpTransaction,
  Keypair as ClassicKeypair,
  Server as HorizonServer,
} from "stellar-sdk";

//
// Groups together core transactions from both libraries
//
export { SorobanTransaction, SorobanFeeBumpTransaction };
export { ClassicTransaction, ClassicFeeBumpTransaction };
export type InnerTransaction = SorobanTransaction | ClassicTransaction;

//
// Groups together fee bump transactions from both libraries
//
export type FeeBumpTransaction =
  | SorobanFeeBumpTransaction
  | ClassicFeeBumpTransaction;

//
// Bundles single type for Transactions
//
export type Transaction = InnerTransaction | FeeBumpTransaction;

export type TransactionXdr = string;

//
// Networks
//

export type Network = {
  name: NetworksList;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  friendbotUrl?: string;
};

export enum NetworksList {
  testnet = "testnet",
  futurenet = "futurenet",
  // mainnet = "mainnet",
  // custom = "custom",
}

//
// Combines keypair types from both libraries
//
export { SorobanKeypair, ClassicKeypair };
export type Keypair = SorobanKeypair | ClassicKeypair;

//
// Export server types from both libraries
//
export { SorobanRpcServer, HorizonServer };

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;

export type Address = SorobanAddress | string;
