import { Transaction } from '@stellar/stellar-sdk'

import { StellarPlusError } from 'stellar-plus/error'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { extractTransactionData } from 'stellar-plus/error/helpers/transaction'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { FeeBumpPipelineInput } from './types'

export enum ErrorCodesPipelineFeeBump {
  // PFB0 General
  PFB001 = 'PFB001',
}

const couldntWrapFeeBump = (
  error: Error,
  conveyorBeltErrorMeta: ConveyorBeltErrorMeta<FeeBumpPipelineInput, BeltMetadata>,
  innerTransaction: Transaction
): StellarPlusError => {
  return new StellarPlusError({
    code: ErrorCodesPipelineFeeBump.PFB001,
    message: 'Error building fee bump transaction!',
    source: 'PipelineFeeBump',
    details: `An issue occurred while building the fee bump transaction:'${error.message}'- Refer to the meta section for more details.`,
    meta: {
      error,
      transactionData: extractTransactionData(innerTransaction),
      conveyorBeltErrorMeta,
    },
  })
}

export const PFBError = {
  couldntWrapFeeBump,
}
