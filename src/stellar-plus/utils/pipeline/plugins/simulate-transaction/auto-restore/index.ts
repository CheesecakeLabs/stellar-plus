import {
  Account,
  Operation,
  SorobanDataBuilder,
  rpc as SorobanRpc,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk'

import {
  BuildTransactionPipelineInput,
  BuildTransactionPipelineOutput,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineOutput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOptions,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelinePlugin,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { FeeBumpHeader } from 'stellar-plus/core/types'
import { DefaultRpcHandler } from 'stellar-plus/rpc'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { NetworkConfig, TransactionInvocation } from 'stellar-plus/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { InjectPreprocessParameterPlugin } from '../../generic/inject-preprocess-parameter'
import { FeeBumpWrapperPlugin } from '../../submit-transaction/fee-bump'

export class AutoRestorePlugin
  implements
    BeltPluginType<
      SimulateTransactionPipelineInput,
      SimulateTransactionPipelineOutput,
      SimulateTransactionPipelineType
    >
{
  readonly type = SimulateTransactionPipelineType.id
  readonly name: string = 'AutoRestorePlugin'

  private restoreTxInvocation: TransactionInvocation
  private networkConfig: NetworkConfig
  private rpcHandler: RpcHandler
  private sorobanTransactionPipelinePlugins: SorobanTransactionPipelinePlugin[] = []

  constructor(restoreTxInvocation: TransactionInvocation, networkConfig: NetworkConfig, customRpcHandler?: RpcHandler) {
    this.restoreTxInvocation = restoreTxInvocation
    this.networkConfig = networkConfig
    this.rpcHandler = customRpcHandler ? customRpcHandler : new DefaultRpcHandler(this.networkConfig)

    if (restoreTxInvocation.feeBump) {
      this.sorobanTransactionPipelinePlugins.push(
        new FeeBumpWrapperPlugin(restoreTxInvocation.feeBump as FeeBumpHeader)
      )
    }
  }

  public async postProcess(
    item: SimulateTransactionPipelineOutput,
    _meta: BeltMetadata
  ): Promise<SimulateTransactionPipelineOutput> {
    const { response, assembledTransaction }: SimulateTransactionPipelineOutput = item

    if (SorobanRpc.Api.isSimulationRestore(response)) {
      await this.restore((response as SorobanRpc.Api.SimulateTransactionRestoreResponse).restorePreamble)
      if (assembledTransaction.source === this.restoreTxInvocation.header.source) {
        const updatedTransaction = this.bumpSequence(
          assembledTransaction,
          response as SorobanRpc.Api.SimulateTransactionRestoreResponse
        )

        return {
          ...item,
          assembledTransaction: updatedTransaction,
        } as SimulateTransactionPipelineOutput
      }
    }

    return item
  }

  private async restore(restorePreamble: {
    minResourceFee: string
    transactionData: SorobanDataBuilder
  }): Promise<SorobanTransactionPipelineOutput> {
    const operation = Operation.restoreFootprint({})

    const sorobanTransactionData = restorePreamble.transactionData.build()
    const injectionParameter = { sorobanData: sorobanTransactionData }

    const executionPluginToInjectSorobanData = new InjectPreprocessParameterPlugin<
      BuildTransactionPipelineInput,
      BuildTransactionPipelineOutput,
      BuildTransactionPipelineType,
      typeof injectionParameter
    >(injectionParameter, BuildTransactionPipelineType.id, 'preProcess')

    const sorobanTransactionPipeline = new SorobanTransactionPipeline(this.networkConfig, {
      rpcHandler: this.rpcHandler,
      plugins: this.sorobanTransactionPipelinePlugins,
    } as SorobanTransactionPipelineOptions)

    return await sorobanTransactionPipeline.execute({
      txInvocation: this.restoreTxInvocation,

      operations: [operation],
      networkConfig: this.networkConfig,
      options: {
        executionPlugins: [executionPluginToInjectSorobanData],
      },
    } as SorobanTransactionPipelineInput)
  }

  private bumpSequence(
    transaction: Transaction,
    simulationResponse: SorobanRpc.Api.SimulateTransactionRestoreResponse
  ): Transaction {
    let updatedTimeBounds: { minTime: string; maxTime: string } | undefined

    if (transaction.timeBounds) {
      const additionalTimeout = this.restoreTxInvocation.header.timeout ? this.restoreTxInvocation.header.timeout : 30

      updatedTimeBounds = {
        minTime: transaction.timeBounds?.minTime,
        maxTime: (Number(transaction.timeBounds?.maxTime) + additionalTimeout).toString(),
      }
    }

    // The sequence number extracted from the existing envelope is already bumped by 1
    // so building the new envelope will automatically bump it once more.
    const sourceAccount = new Account(transaction.source, transaction.sequence)

    const updatedTransaction = new TransactionBuilder(sourceAccount, {
      fee: transaction.fee,
      memo: transaction.memo,
      networkPassphrase: transaction.networkPassphrase,
      timebounds: updatedTimeBounds,
      ledgerbounds: transaction.ledgerBounds,
      minAccountSequence: transaction.minAccountSequence,
      minAccountSequenceAge: transaction.minAccountSequenceAge,
      minAccountSequenceLedgerGap: transaction.minAccountSequenceLedgerGap,
      extraSigners: transaction.extraSigners,
      sorobanData: simulationResponse.transactionData.build(),
    })

    transaction
      .toEnvelope()
      .v1()
      .tx()
      .operations()
      .forEach((op) => {
        updatedTransaction.addOperation(op)
      })

    return updatedTransaction.build()
  }
}
