import axios from "axios";
import {
  SorobanDataBuilder,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  assembleTransaction,
  parseRawSimulation,
  xdr,
} from "soroban-client";

import {
  RequestPayload,
  SendTransactionAPIResponse,
  SimulateTransactionAPIResponse,
} from "./types";
import { parseRawSendTransaction } from "soroban-client/lib/parsers";
import { RpcHandler } from "../types";
import { Network } from "../../types";

export class ValidationCloudRpcHandler implements RpcHandler {
  private apiKey: string;
  private network: Network;
  private baseUrl: string;
  private id: string;
  constructor(network: Network, apiKey: string) {
    this.network = network;
    this.apiKey = apiKey;
    this.baseUrl =
      this.network.name === "testnet"
        ? "https://testnet.stellar.validationcloud.io/v1/"
        : "https://testnet.stellar.validationcloud.io/v1/"; // no support to mainnet yet

    this.id = this.generateId();
  }

  private generateId(): string {
    const id = Math.floor(Math.random() * 100000).toString();
    this.id = id;
    return id;
  }

  private async fetch(payload: RequestPayload): Promise<any> {
    const requestUrl = this.baseUrl + this.apiKey;
    try {
      const response = await axios.post(requestUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (e) {
      console.log("Failed when invoking Validation Cloud API", e);
      throw e;
    }
  }

  public async getTransaction(
    txHash: string
  ): Promise<SorobanRpc.GetTransactionResponse> {
    const payload: RequestPayload = {
      jsonrpc: "2.0",
      id: this.generateId(),
      method: "getTransaction",
      params: {
        hash: txHash,
      },
    };

    const response = await this.fetch(payload);
    return response.json();
  }

  public async simulateTransaction(
    tx: Transaction
  ): Promise<SorobanRpc.SimulateTransactionResponse> {
    const txXdr = tx.toXDR();
    const payload: RequestPayload = {
      jsonrpc: "2.0",
      id: this.generateId(), // no need for tracking it currently
      method: "simulateTransaction",
      params: {
        transaction: txXdr,
      },
    };

    const response: SimulateTransactionAPIResponse = await this.fetch(payload);

    const formattedResponse: SorobanRpc.SimulateTransactionResponse =
      parseRawSimulation(
        response.result as SorobanRpc.RawSimulateTransactionResponse
      );

    return formattedResponse;
  }

  public async prepareTransaction(tx: Transaction): Promise<Transaction> {
    const response = (await this.simulateTransaction(
      tx
    )) as SorobanRpc.SimulateTransactionResponse;

    const assembledTx = assembleTransaction(
      tx,
      this.network.networkPassphrase,
      response
    );

    return assembledTx.build();
  }

  public async submitTransaction(
    tx: Transaction
  ): Promise<SorobanRpc.SendTransactionResponse> {
    const txXdr = tx.toXDR();
    console.log("txXdr:", txXdr);
    const payload: RequestPayload = {
      jsonrpc: "2.0",
      id: this.id,
      method: "sendTransaction",
      params: {
        transaction: txXdr,
      },
    };

    const response: SendTransactionAPIResponse = await this.fetch(payload);
    console.log("response send:", response);
    const formattedResponse: SorobanRpc.SendTransactionResponse =
      parseRawSendTransaction(
        response.result as SorobanRpc.RawSendTransactionResponse
      );

    return formattedResponse;
  }
}
