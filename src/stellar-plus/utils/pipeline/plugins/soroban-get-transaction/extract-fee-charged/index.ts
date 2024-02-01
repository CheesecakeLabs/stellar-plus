import {
  FeeChargedOutput,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractFeeChargedPlugin
  implements
    BeltPluginType<
      SorobanGetTransactionPipelineInput,
      SorobanGetTransactionPipelineOutput,
      SorobanGetTransactionPipelineType
    >
{
  readonly type = SorobanGetTransactionPipelineType.id
  readonly name: string = 'ExtractFeeChargedPlugin'

  private callback?: (args: FeeChargedOutput, itemId: string) => void

  constructor(callback?: (args: FeeChargedOutput, itemId: string) => void) {
    this.callback = callback
  }

  public async postProcess(
    item: SorobanGetTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { response, output } = item

    const feeCharged = response.resultXdr.feeCharged().toString()

    const pluginOutput: FeeChargedOutput = {
      feeCharged,
    }

    if (this.callback) {
      this.callback(pluginOutput, _meta.itemId)
    }

    return {
      ...item,
      output: {
        ...output,
        ...pluginOutput,
      },
    }
  }
}
