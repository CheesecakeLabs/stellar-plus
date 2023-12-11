import axios from 'axios'
import { SorobanRpc, xdr as SorobanXdr, Transaction, assembleTransaction, parseRawSimulation } from 'soroban-client'
import { parseRawSendTransaction } from 'soroban-client/lib/parsers'

import { RpcHandler } from '@rpc/types'
import {
  ApiResponse,
  RequestPayload,
  SendTransactionAPIResponse,
  SimulateTransactionAPIResponse,
} from '@rpc/validation-cloud-handler/types'
import { Network } from '@stellar-plus/types'

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
      .catch(() => {
        // console.log('response', error)
        throw new Error('Failed when invoking Validation Cloud API')
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
    | SorobanRpc.GetTransactionResponse
    | SorobanRpc.GetFailedTransactionResponse
    | SorobanRpc.GetMissingTransactionResponse
    | SorobanRpc.GetSuccessfulTransactionResponse
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
    const rawGetResponse = response.result as SorobanRpc.RawGetTransactionResponse

    if (rawGetResponse.status === 'NOT_FOUND') {
      return rawGetResponse as SorobanRpc.GetMissingTransactionResponse
    }

    if (rawGetResponse.status === 'FAILED') {
      return rawGetResponse as SorobanRpc.GetFailedTransactionResponse
    }

    //
    // Necessary to parse the inner values
    // as we need because they're returned as
    // raw xdr strings.
    //
    if (rawGetResponse.status === 'SUCCESS') {
      return {
        ...(rawGetResponse as unknown as SorobanRpc.GetSuccessfulTransactionResponse),
        resultMetaXdr: SorobanXdr.TransactionMeta.fromXDR(
          Buffer.from(rawGetResponse.resultMetaXdr as string, 'base64'),
          'raw'
        ),
      } as unknown as SorobanRpc.GetSuccessfulTransactionResponse
    }

    return rawGetResponse as SorobanRpc.GetTransactionResponse
  }

  /**
   *
   * @param {Transaction} tx - The transaction to simulate.
   *
   * @returns {Promise<SorobanRpc.SimulateTransactionResponse>} The transaction simulation response from the Soroban server.
   *
   * @description - Simulates the transaction on the Soroban server.
   */
  public async simulateTransaction(tx: Transaction): Promise<SorobanRpc.SimulateTransactionResponse> {
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

    const formattedResponse: SorobanRpc.SimulateTransactionResponse = parseRawSimulation(
      response.result as SorobanRpc.RawSimulateTransactionResponse
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
    const response = (await this.simulateTransaction(tx)) as SorobanRpc.SimulateTransactionResponse
    const assembledTx = assembleTransaction(tx, this.network.networkPassphrase, response)
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
  public async submitTransaction(tx: Transaction): Promise<SorobanRpc.SendTransactionResponse> {
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

    const formattedResponse: SorobanRpc.SendTransactionResponse = parseRawSendTransaction(
      response.result as SorobanRpc.RawSendTransactionResponse
    )

    return formattedResponse
  }
}
