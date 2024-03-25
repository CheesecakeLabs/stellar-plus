import { SorobanRpc, Transaction, xdr } from '@stellar/stellar-sdk'

import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelinePlugin,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { PSIError } from './errors'

export class SimulateTransactionPipeline extends ConveyorBelt<
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType
> {
  constructor(plugins?: SimulateTransactionPipelinePlugin[]) {
    super({
      type: SimulateTransactionPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(
    item: SimulateTransactionPipelineInput,
    itemId: string
  ): Promise<SimulateTransactionPipelineOutput> {
    const { transaction, rpcHandler }: SimulateTransactionPipelineInput = item as SimulateTransactionPipelineInput

    let simulationResponse: SorobanRpc.Api.SimulateTransactionResponse

    try {
      simulationResponse = await rpcHandler.simulateTransaction(transaction)
    } catch (e) {
      throw PSIError.failedToSimulateTransaction(e as Error, extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
    }

    if (SorobanRpc.Api.isSimulationError(simulationResponse)) {
      throw PSIError.simulationFailed(simulationResponse, extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
    }

    if (SorobanRpc.Api.isSimulationRestore(simulationResponse) && simulationResponse.result) {
      return {
        response: simulationResponse as SorobanRpc.Api.SimulateTransactionRestoreResponse,
        assembledTransaction: this.assembleTransaction(transaction, simulationResponse),
      } as SimulateTransactionPipelineOutput
    }

    if (SorobanRpc.Api.isSimulationSuccess(simulationResponse)) {
      return {
        response: simulationResponse as SorobanRpc.Api.SimulateTransactionSuccessResponse,
        assembledTransaction: this.assembleTransaction(transaction, simulationResponse),
      } as SimulateTransactionPipelineOutput
    }

    throw PSIError.simulationResultCouldNotBeVerified(
      simulationResponse,
      extractConveyorBeltErrorMeta(item, this.getMeta(itemId))
    )
  }

  private assembleTransaction(
    transaction: Transaction,
    simulationResponse: SorobanRpc.Api.SimulateTransactionSuccessResponse
  ): Transaction {
    try {
      return SorobanRpc.assembleTransaction(transaction, simulationResponse).build()
    } catch (e) {
      throw new Error('assembleTransaction failed')
    }
  }
}
