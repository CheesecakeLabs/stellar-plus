import { Buffer } from 'buffer'

import { SorobanRpc, Transaction, xdr } from '@stellar/stellar-sdk'
import axios from 'axios'
// import { SorobanRpc, xdr as SorobanXdr, assembleTransaction, parseRawSimulation } from 'soroban-client'
// import { parseRawSendTransaction } from 'soroban-client/lib/parsers'

import { RpcHandler } from 'stellar-plus/rpc/types'
import {
  ApiResponse,
  RequestPayload,
  SendTransactionAPIResponse,
  SimulateTransactionAPIResponse,
} from 'stellar-plus/rpc/validation-cloud-handler/types'
import { Network } from 'stellar-plus/types'

import { VCRPCError } from './errors'

export class ValidationCloudRpcHandler implements RpcHandler {
  private apiKey: string
  private network: Network
  private baseUrl: string
  private id: string

  /**
   *
   * @param {Network} network - The network to use.
   * @param {string} apiKey - The API key to authenticate with Validation Cloud's API.
   *
   * @description - This rpc handler integrates directly with Validation Cloud's API. And uses their RPC infrastructure to carry out the RPC functions.
   *
   */
  constructor(network: Network, apiKey: string) {
    if (!apiKey) {
      throw VCRPCError.invalidApiKey()
    }

    this.network = network
    this.apiKey = apiKey
    this.baseUrl =
      this.network.name === 'testnet'
        ? 'https://testnet.stellar.validationcloud.io/v1/'
        : 'https://testnet.stellar.validationcloud.io/v1/' // no support to mainnet yet

    this.id = this.generateId()
  }

  private generateId(): string {
    const id = Math.floor(Math.random() * 100000).toString()
    this.id = id
    return id
  }

  private async fetch(payload: RequestPayload): Promise<ApiResponse> {
    const requestUrl = this.baseUrl + this.apiKey

    return await axios
      .post(requestUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        return res.data as ApiResponse
      })
      .catch((error) => {
        throw VCRPCError.failedToInvokeVCApi(error as Error, payload)
      })
  }

  /**
   *
   * @param {string} txHash - The transaction hash to get.
   *
   * @returns {Promise<SorobanRpc.GetTransactionResponse | SorobanRpc.GetFailedTransactionResponse | SorobanRpc.GetMissingTransactionResponse | SorobanRpc.GetSuccessfulTransactionResponse>} The transaction response from the Soroban server.
   *
   * @description - Gets the transaction from the Soroban server.
   */
  public async getTransaction(
    txHash: string
  ): Promise<
    | SorobanRpc.Api.GetTransactionResponse
    | SorobanRpc.Api.GetFailedTransactionResponse
    | SorobanRpc.Api.GetMissingTransactionResponse
    | SorobanRpc.Api.GetSuccessfulTransactionResponse
  > {
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.generateId(),
      method: 'getTransaction',
      params: {
        hash: txHash,
      },
    }

    const response = (await this.fetch(payload)) as ApiResponse
    const rawGetResponse = response.result as SorobanRpc.Api.RawGetTransactionResponse

    if (rawGetResponse.status === 'NOT_FOUND') {
      return rawGetResponse as SorobanRpc.Api.GetMissingTransactionResponse
    }

    if (rawGetResponse.status === 'FAILED') {
      return rawGetResponse as unknown as SorobanRpc.Api.GetFailedTransactionResponse
    }

    //
    // Necessary to parse the inner values
    // as we need because they're returned as
    // raw xdr strings.
    //
    if (rawGetResponse.status === 'SUCCESS') {
      return {
        ...(rawGetResponse as unknown as SorobanRpc.Api.GetSuccessfulTransactionResponse),
        resultMetaXdr: xdr.TransactionMeta.fromXDR(
          Buffer.from(rawGetResponse.resultMetaXdr as string, 'base64'),
          'raw'
        ),
      } as unknown as SorobanRpc.Api.GetSuccessfulTransactionResponse
    }

    return rawGetResponse as SorobanRpc.Api.GetTransactionResponse
  }

  /**
   * @returns {Promise<SorobanRpc.GetLatestLedgerResponse>} The latest ledger response from the Soroban server.
   * @description - Gets the latest ledger from the Soroban RPC server.
   * */
  public async getLatestLedger(): Promise<SorobanRpc.Api.GetLatestLedgerResponse> {
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'getLatestLedger',
    }

    const response = (await this.fetch(payload)) as ApiResponse

    return response.result as SorobanRpc.Api.GetLatestLedgerResponse
  }

  /**
   * @returns {Promise<SorobanRpc.GetHealthResponse>} The health response from the Soroban server.
   * @description - Gets the health of the Soroban RPC server.
   * */
  async getHealth(): Promise<SorobanRpc.Api.GetHealthResponse> {
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'getHealth',
    }

    const response = (await this.fetch(payload)) as ApiResponse

    return response.result as SorobanRpc.Api.GetHealthResponse
  }

  /**
   * @returns {Promise<SorobanRpc.GetNetworkResponse>} The network response from the Soroban server.
   * @description - Gets the network of the Soroban RPC server.
   * */
  async getNetwork(): Promise<SorobanRpc.Api.GetNetworkResponse> {
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'getNetwork',
    }

    const response = (await this.fetch(payload)) as ApiResponse

    return response.result as SorobanRpc.Api.GetNetworkResponse
  }

  /**
   *
   * @description - Important: This integration might fail due to the RPC server build on VC. startLedger recently has been changed to a 'number'. Refer to https://github.com/stellar/js-stellar-sdk/issues/893
   *
   * @args {SorobanRpc.GetEventsRequest} request - The events request to get.
   * @args {Api.EventFilter[]} request.filters - The filters to apply to the events.
   * @args {number} request.startLedger - The start ledger to get the events from.
   * @args {string} request.cursor - The cursor to get the events from.
   * @args {number} request.limit - The limit of events to get.
   *
   *
   * @returns {SorobanRpc.GetEventsResponse} The events response from the Soroban server.
   *
   * @description - Gets the events from the Soroban server.
   */
  async getEvents(request: SorobanRpc.Server.GetEventsRequest): Promise<SorobanRpc.Api.GetEventsResponse> {
    const cursor = request.cursor
    const limit = request.limit
    const pagination = { cursor, limit }

    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'getEvents',
      params: { ...request, pagination },
    }

    const response = (await this.fetch(payload)) as ApiResponse

    return response.result as SorobanRpc.Api.GetEventsResponse
  }

  /**
   *
   * @param {xdr.LedgerKey[]} keys - The keys to get the ledger entries for.
   *
   * @returns {SorobanRpc.GetLedgerEntriesResponse} The ledger entries response from the Soroban server.
   *
   * @description - Gets the ledger entries from the Soroban server.
   */
  async getLedgerEntries(...keys: xdr.LedgerKey[]): Promise<SorobanRpc.Api.GetLedgerEntriesResponse> {
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'getLedgerEntries',
      params: {
        keys: keys.map((key) => key.toXDR()),
      },
    }

    const response = (await this.fetch(payload)) as ApiResponse

    return response.result as SorobanRpc.Api.GetLedgerEntriesResponse
  }

  /**
   *
   * @param {Transaction} tx - The transaction to simulate.
   *
   * @returns {Promise<SorobanRpc.SimulateTransactionResponse>} The transaction simulation response from the Soroban server.
   *
   * @description - Simulates the transaction on the Soroban server.
   */
  public async simulateTransaction(tx: Transaction): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
    const txXdr = tx.toXDR()
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.generateId(), // no need for tracking it currently
      method: 'simulateTransaction',
      params: {
        transaction: txXdr,
      },
    }

    const response = (await this.fetch(payload)) as SimulateTransactionAPIResponse

    const formattedResponse: SorobanRpc.Api.SimulateTransactionResponse = SorobanRpc.parseRawSimulation(
      response.result as unknown as SorobanRpc.Api.RawSimulateTransactionResponse
    )

    return formattedResponse
  }

  /**
   *
   * @param {Transaction} tx - The transaction to prepare.
   *
   * @returns {Promise<Transaction>} The prepared transaction.
   *
   * @description - Prepares the transaction on the Soroban server.
   */
  public async prepareTransaction(tx: Transaction): Promise<Transaction> {
    const response = (await this.simulateTransaction(tx)) as SorobanRpc.Api.SimulateTransactionResponse
    const assembledTx = SorobanRpc.assembleTransaction(tx, response)
    return assembledTx.build()
  }

  /**
   *
   * @param {Transaction} tx - The transaction to submit.
   *
   * @returns {Promise<SorobanRpc.SendTransactionResponse>} The transaction submission response from the Soroban server.
   *
   * @description - Submits the transaction on the Soroban server.
   */
  public async submitTransaction(tx: Transaction): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const txXdr = tx.toXDR()
    const payload: RequestPayload = {
      jsonrpc: '2.0',
      id: this.id,
      method: 'sendTransaction',
      params: {
        transaction: txXdr,
      },
    }

    const response = (await this.fetch(payload)) as SendTransactionAPIResponse

    const formattedResponse: SorobanRpc.Api.SendTransactionResponse =
      response.result as SorobanRpc.Api.RawSendTransactionResponse

    return formattedResponse
  }
}
