import { Address, xdr } from '@stellar/stellar-sdk'

import {
  ContractIdOutput,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ExtractContractIdPlugin
  implements
    BeltPluginType<
      SorobanGetTransactionPipelineInput,
      SorobanGetTransactionPipelineOutput,
      SorobanGetTransactionPipelineType
    >
{
  readonly type = SorobanGetTransactionPipelineType.id
  readonly name: string = 'ExtractContractIdPlugin'

  public async postProcess(
    item: SorobanGetTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { response, output } = item

    let contractId: string

    try {
      contractId = Address.fromScAddress(
        response.resultMetaXdr.v4().sorobanMeta()?.returnValue()?.address() as xdr.ScAddress
      ).toString()
    } catch (e) {
      contractId = ''
    }

    const pluginOutput: ContractIdOutput = {
      contractId,
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
