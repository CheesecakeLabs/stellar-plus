import { rpc as SorobanRpc, xdr } from '@stellar/stellar-sdk'

import { TransactionResources } from 'stellar-plus/core/contract-engine/types'
import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractTransactionResourcesPlugin
  implements
    BeltPluginType<
      SimulateTransactionPipelineInput,
      SimulateTransactionPipelineOutput,
      SimulateTransactionPipelineType
    >
{
  readonly type = SimulateTransactionPipelineType.id
  readonly name: string = 'ExtractTransactionResourcesPlugin'
  private callback?: (args: TransactionResources, itemId: string) => void

  constructor(callback?: (args: TransactionResources, itemId: string) => void) {
    this.callback = callback
  }

  public async postProcess(
    item: SimulateTransactionPipelineOutput,
    meta: BeltMetadata
  ): Promise<SimulateTransactionPipelineOutput> {
    const simulatedTransaction = item.response as SorobanRpc.Api.SimulateTransactionSuccessResponse

    const calculateEventSize = (event: xdr.DiagnosticEvent): number => {
      if (event.event()?.type().name === 'diagnostic') {
        return 0
      }
      return event.toXDR().length
    }

    const sorobanTransactionData = simulatedTransaction.transactionData.build()
    const events = simulatedTransaction.events?.map((event) => calculateEventSize(event))
    const returnValueSize = simulatedTransaction.result?.retval.toXDR().length
    const transactionDataSize = sorobanTransactionData.toXDR().length
    const eventsSize = events?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    const resources: TransactionResources = {
      cpuInstructions: Number(sorobanTransactionData?.resources().instructions()),
      ram: 0, //Number(simulatedTransaction.cost?.memBytes), //Review during refactor for v1
      minResourceFee: Number(simulatedTransaction.minResourceFee),
      ledgerReadBytes: sorobanTransactionData?.resources().readBytes(),
      ledgerWriteBytes: sorobanTransactionData?.resources().writeBytes(),
      ledgerEntryReads: sorobanTransactionData?.resources().footprint().readOnly().length,
      ledgerEntryWrites: sorobanTransactionData?.resources().footprint().readWrite().length,
      eventSize: eventsSize,
      returnValueSize: returnValueSize,
      transactionSize: transactionDataSize,
    }

    const updatedItem = {
      ...item,
      output: {
        ...item.output,
        resources,
      },
    }

    if (this.callback) {
      this.callback(resources, meta.itemId)
    }

    return updatedItem
  }
}
