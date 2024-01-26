import { ContractSpec } from '@stellar/stellar-sdk'

import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractInvocationOutputFromSimulationPlugin
  implements
    BeltPluginType<
      SimulateTransactionPipelineInput,
      SimulateTransactionPipelineOutput,
      SimulateTransactionPipelineType
    >
{
  readonly type = SimulateTransactionPipelineType.id
  readonly name: string = 'ExtractContractIdPlugin'
  private spec: ContractSpec
  private method: string

  constructor(spec: ContractSpec, method: string) {
    this.spec = spec
    this.method = method
  }

  public async postProcess(
    item: SimulateTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SimulateTransactionPipelineOutput> {
    const { response } = item

    if (!response.result) {
      // throw CEError.simulationMissingResult(simulated)
      throw new Error('simulationMissingResult')
    }

    const value = this.spec.funcResToNative(this.method, response.result.retval) as unknown

    const pluginOutput = value

    return {
      ...item,
      output: pluginOutput,
    }
  }
}
