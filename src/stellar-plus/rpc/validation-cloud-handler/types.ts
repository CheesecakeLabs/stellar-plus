import { SorobanRpc } from "soroban-client";

export type RequestPayload = {
  jsonrpc: string;
  id?: string;
  method: string;
  params: any;
};

export type SimulateTransactionAPIResponse = {
  jsonrpc: string;
  id: number;
  result?: {
    transactionData?: string; // Optional, stringified base64
    events: string[]; // Optional, array of serialized base64 strings
    minResourceFee: string; // Optional, stringified number
    results?: Array<{
      auth: string[]; // Array of stringified base64
      xdr: string; // Stringified base64
    }>;
    cost?: {
      cpuInsns: string; // Stringified number
      memBytes: string; // Stringified number
    };
    latestLedger: string; // Stringified number
    error?: string; // Optional error message
    restorePreamble?: any;
  };
};

export type SendTransactionAPIResponse = {
  jsonrpc: string;
  id: number;
  result: {
    hash: string; // Hex-encoded transaction hash
    status: SorobanRpc.SendTransactionStatus; //Allowed values: PENDING | DUPLICATE | TRY_AGAIN_LATER | ERROR
    latestLedger: number; // Stringified number, latest ledger known to Soroban-RPC
    latestLedgerCloseTime: number; // Unix timestamp string for ledger close time
    errorResultXdr?: string; // Optional, base64 encoded TransactionResult XDR
  };
};
