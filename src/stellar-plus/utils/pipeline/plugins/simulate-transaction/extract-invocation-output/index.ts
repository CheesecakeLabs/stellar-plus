import { Spec } from '@stellar/stellar-sdk/contract'

import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
  SimulatedInvocationOutput,
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
  private spec: Spec
  private method: string

  constructor(spec: Spec, method: string) {
    this.spec = spec
    this.method = method
  }

  public async postProcess(
    item: SimulateTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SimulateTransactionPipelineOutput> {
    const { response, output } = item

    if (!response.result) {
      throw new Error('simulationMissingResult')
    }

    const value = this.spec.funcResToNative(this.method, response.result.retval) as unknown

    const pluginOutput = { value } as SimulatedInvocationOutput

    const updatedItem = {
      ...item,
      output: {
        ...output,
        ...pluginOutput,
      },
    }
    return updatedItem
  }
}
