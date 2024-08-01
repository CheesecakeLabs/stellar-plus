import { Spec } from '@stellar/stellar-sdk/contract'

import { ContractEngine } from './contract-engine'
import { BuildTransactionPipeline } from './pipelines/build-transaction'
import { ClassicSignRequirementsPipeline } from './pipelines/classic-sign-requirements'
import { ClassicTransactionPipeline } from './pipelines/classic-transaction'
import { FeeBumpPipeline } from './pipelines/fee-bump'
import { SignTransactionPipeline } from './pipelines/sign-transaction'
import { SimulateTransactionPipeline } from './pipelines/simulate-transaction'
import { SorobanGetTransactionPipeline } from './pipelines/soroban-get-transaction'
import { SorobanTransactionPipeline } from './pipelines/soroban-transaction'
import { SubmitTransactionPipeline } from './pipelines/submit-transaction'

export const Core = {
  Pipelines: {
    BuildTransaction: BuildTransactionPipeline,
    ClassicSignRequirements: ClassicSignRequirementsPipeline,
    ClassicTransaction: ClassicTransactionPipeline,
    FeeBump: FeeBumpPipeline,
    SignTransaction: SignTransactionPipeline,
    SimulateTransaction: SimulateTransactionPipeline,
    SorobanGetTransaction: SorobanGetTransactionPipeline,
    SorobanTransaction: SorobanTransactionPipeline,
    SubmitTransaction: SubmitTransactionPipeline,
  },
  ContractEngine: ContractEngine,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  Spec,
}
