import { Address, xdr } from '@stellar/stellar-sdk'

import {
  ContractIdOutput,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelineOutput,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'

import { BeltMetadata, BeltPluginType } from '../../conveyor-belts/types'

export class ExtractWrappedContractIdPlugin
  implements
    BeltPluginType<
      SorobanGetTransactionPipelineInput,
      SorobanGetTransactionPipelineOutput,
      SorobanGetTransactionPipelineType
    >
{
  readonly type: SorobanGetTransactionPipelineType = 'SorobanGetTransactionPipeline'
  readonly name: string = 'ExtractWrappedContractIdPlugin'

  public async postProcess(
    item: SorobanGetTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SorobanGetTransactionPipelineOutput> {
    const { response, output } = item

    const contractId = Address.fromScAddress(
      response.resultMetaXdr.v3().sorobanMeta()?.returnValue().address() as xdr.ScAddress
    ).toString()

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
