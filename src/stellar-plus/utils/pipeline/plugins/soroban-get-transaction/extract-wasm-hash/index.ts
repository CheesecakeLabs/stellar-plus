import {
  ContractWasmHashOutput,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractWasmHashPlugin
  implements
    BeltPluginType<
      SorobanGetTransactionPipelineInput,
      SorobanGetTransactionPipelineOutput,
      SorobanGetTransactionPipelineType
    >
{
  readonly type = SorobanGetTransactionPipelineType.id
  readonly name: string = 'ExtractWasmHashPlugin'

  public async postProcess(
    item: SorobanGetTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { response, output } = item

    const wasmHash = (response.resultMetaXdr.v3().sorobanMeta()?.returnValue().value() as Buffer).toString(
      'hex'
    ) as string

    const pluginOutput: ContractWasmHashOutput = {
      wasmHash,
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
