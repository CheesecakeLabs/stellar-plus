import { Account, TransactionBuilder } from '@stellar/stellar-sdk'

import { PBTError } from 'stellar-plus/core/pipelines/build-transaction/errors'
import {
  BuildTransactionPipelineInput as BTInput,
  BuildTransactionPipelineOutput as BTOutput,
  BuildTransactionPipelinePlugin as BTPluginType,
  BuildTransactionPipelineType as BTType,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

export class BuildTransactionPipeline extends ConveyorBelt<BTInput, BTOutput, BTType> {
  constructor(plugins?: BTPluginType[]) {
    super({
      type: BuildTransactionPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(item: BTInput, itemId: string): Promise<BTOutput> {
    const { header, horizonHandler, operations, networkPassphrase }: BTInput = item
    let sourceAccount: Account

    try {
      sourceAccount = (await horizonHandler.loadAccount(header.source)) as Account
    } catch (e) {
      throw PBTError.couldntLoadAccount(e as Error, extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
    }

    let txEnvelope: TransactionBuilder
    try {
      txEnvelope = new TransactionBuilder(sourceAccount, {
        fee: header.fee,
        networkPassphrase: networkPassphrase,
      })
    } catch (e) {
      throw PBTError.couldntCreateTransactionBuilder(
        e as Error,
        extractConveyorBeltErrorMeta(item, this.getMeta(itemId))
      )
    }

    try {
      for (const operation of operations) {
        txEnvelope.addOperation(operation)
      }
      txEnvelope.setTimeout(header.timeout)
    } catch (e) {
      throw PBTError.couldntAddOperations(e as Error, extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
    }

    try {
      return txEnvelope.build() as BTOutput
    } catch (e) {
      throw PBTError.couldntBuildTransaction(e as Error, extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))
    }
  }
}
