import { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import { SignatureRequirement } from 'stellar-plus/core/types'
import { BeltPluginType, GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export type SignTransactionPipelineInput = {
  transaction: Transaction | FeeBumpTransaction
  signatureRequirements: SignatureRequirement[]
  signers: AccountHandler[]
}

export type SignTransactionPipelineOutput = Transaction | FeeBumpTransaction

export enum SignTransactionPipelineType {
  id = 'SignTransactionPipeline',
}

export type SignTransactionPipelinePlugin = BeltPluginType<
  SignTransactionPipelineInput,
  SignTransactionPipelineOutput,
  SignTransactionPipelineType | GenericPlugin
>
