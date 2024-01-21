import { Account, TransactionBuilder } from '@stellar/stellar-sdk'

import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { BeltProcessFunction } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import {
  BuildTransactionPipeline,
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelinePlugin,
} from './types'

const buildTransactionPipelineProcessor: BeltProcessFunction<
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput
> = async (
  item: BuildTransactionPipelineInput,
  _itemId: string,
  _beltId: string
): Promise<BuildTransactionPipelineOutput> => {
  try {
    const { header, horizonHandler, operations, networkPassphrase }: BuildTransactionPipelineInput = item
    const sourceAccount = (await horizonHandler.loadAccount(header.source)) as Account
    const txEnvelope = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: networkPassphrase,
    })
    for (const operation of operations) {
      txEnvelope.addOperation(operation)
    }
    txEnvelope.setTimeout(header.timeout)

    return txEnvelope.build()
  } catch (e) {
    console.log(e)
    // throw STPError.failedToBuildTransaction(e as Error, header)
    throw e
  }
}

export const buildTransactionPipeline = (plugins: BuildTransactionPipelinePlugin[]): BuildTransactionPipeline => {
  return new ConveyorBelt(
    'BuildTransactionPipeline',
    buildTransactionPipelineProcessor,
    plugins
  ) as BuildTransactionPipeline
}
