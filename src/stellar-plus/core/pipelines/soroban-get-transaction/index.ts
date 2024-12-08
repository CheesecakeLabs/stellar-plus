/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FeeBumpTransaction, rpc as SorobanRpc, Transaction } from '@stellar/stellar-sdk'

import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { SGTError } from './errors'
import {
  SorobanGetTransactionOptions,
  SorobanGetTransactionPipelineConstructor,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from './types'

export class SorobanGetTransactionPipeline extends ConveyorBelt<
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType
> {
  protected options: SorobanGetTransactionOptions

  constructor({ plugins, options }: SorobanGetTransactionPipelineConstructor = {}) {
    super({
      type: SorobanGetTransactionPipelineType.id,
      plugins: plugins || [],
    })
    this.options = options || { defaultSecondsToWait: 30, useEnvelopeTimeout: true }
  }

  //    Waits for the given transaction to be processed by the Soroban server.
  //    Soroban transactions are processed asynchronously, so this method will wait for the transaction to be processed.
  //    If the transaction is not processed within the given timeout, it will throw an error.
  //    If the transaction is processed, it will return the response from the Soroban server.
  //    If the transaction fails, it will throw an error.
  protected async process(
    item: SorobanGetTransactionPipelineInput,
    itemId: string
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { sorobanSubmission, transactionEnvelope, rpcHandler }: SorobanGetTransactionPipelineInput = item
    const { hash } = sorobanSubmission

    const secondsToWait = this.getSecondsToWait(transactionEnvelope)
    const waitUntil = Date.now() + secondsToWait * 1000
    const initialWaitTime = 1000 //1 second

    let currentWaitTime = initialWaitTime

    let updatedTransaction = await rpcHandler.getTransaction(hash)
    while (Date.now() < waitUntil && updatedTransaction.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, currentWaitTime))
      updatedTransaction = await rpcHandler.getTransaction(hash)
      currentWaitTime *= 2 // Exponential backoff
    }

    if (updatedTransaction.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return { response: updatedTransaction as SorobanRpc.Api.GetSuccessfulTransactionResponse }
    }

    if (updatedTransaction.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw SGTError.transactionFailed(
        extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
        updatedTransaction as SorobanRpc.Api.GetFailedTransactionResponse
      )
    }
    throw SGTError.transactionNotFound(extractConveyorBeltErrorMeta(item, this.getMeta(itemId)), secondsToWait, hash)
  }
  private getSecondsToWait(transactionEnvelope?: Transaction | FeeBumpTransaction): number {
    let secondsToWait = this.options.defaultSecondsToWait

    if (this.options.useEnvelopeTimeout && transactionEnvelope) {
      const txTimeout = (transactionEnvelope as FeeBumpTransaction).innerTransaction
        ? this.getTransactionTimeoutInSeconds((transactionEnvelope as FeeBumpTransaction).innerTransaction)
        : this.getTransactionTimeoutInSeconds(transactionEnvelope as Transaction)

      if (txTimeout > 0) {
        secondsToWait = txTimeout
      }
    }

    return secondsToWait
  }

  private getTransactionTimeoutInSeconds(transactionEnvelope: Transaction): number {
    const txTimeout = Number(transactionEnvelope.timeBounds?.maxTime) ?? 0
    return txTimeout > 0 ? txTimeout - Math.floor(Date.now() / 1000) : 0
  }
}
