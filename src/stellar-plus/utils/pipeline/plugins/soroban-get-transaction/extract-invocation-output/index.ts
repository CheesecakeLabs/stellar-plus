import { Spec } from '@stellar/stellar-sdk/contract'

import {
  ContractInvocationOutput,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractInvocationOutputPlugin<OutputType>
  implements
    BeltPluginType<
      SorobanGetTransactionPipelineInput,
      SorobanGetTransactionPipelineOutput,
      SorobanGetTransactionPipelineType
    >
{
  readonly type = SorobanGetTransactionPipelineType.id
  readonly name: string = 'ExtractInvocationOutputPlugin'
  private spec: Spec
  private method: string

  constructor(spec: Spec, method: string) {
    this.spec = spec
    this.method = method
  }

  public async postProcess(
    item: SorobanGetTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { response, output }: SorobanGetTransactionPipelineOutput = item as SorobanGetTransactionPipelineOutput

    let value: unknown
    try {
      value = this.spec.funcResToNative(
        this.method,
        response.resultMetaXdr.v4().sorobanMeta()?.returnValue()?.toXDR('base64') as string
      ) as unknown
    } catch (e) {
      value = {}
    }

    const pluginOutput: ContractInvocationOutput<string> = {
      value: String(value as OutputType),
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
