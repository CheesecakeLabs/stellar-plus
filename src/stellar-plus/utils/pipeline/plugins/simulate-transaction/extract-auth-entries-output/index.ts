import {
  AuthEntriesOutput,
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractAuthEntriesFromSimulationPlugin
  implements
    BeltPluginType<
      SimulateTransactionPipelineInput,
      SimulateTransactionPipelineOutput,
      SimulateTransactionPipelineType
    >
{
  readonly type = SimulateTransactionPipelineType.id
  readonly name: string = 'ExtractAuthEntriesPlugin'

  public async postProcess(
    item: SimulateTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SimulateTransactionPipelineOutput> {
    const { response, output } = item

    if (!response.result) {
      // TODO:
      // implement error handling here and migrate older CE Error
      // throw CEError.simulationMissingResult(simulated)
      throw new Error('simulationMissingResult')
    }

    const auth = response.result.auth

    const pluginOutput = { auth } as AuthEntriesOutput

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
