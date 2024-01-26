import { SorobanRpc } from '@stellar/stellar-sdk'

import { BuildTransactionPipeline } from 'stellar-plus/core/pipelines/build-transaction'
import {
  BuildTransactionPipelinePlugin,
  BuildTransactionPipelineType,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import { ClassicSignRequirementsPipeline } from 'stellar-plus/core/pipelines/classic-sign-requirements'
import {
  ClassicSignRequirementsPipelinePlugin,
  ClassicSignRequirementsPipelineType,
} from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import { SignTransactionPipeline } from 'stellar-plus/core/pipelines/sign-transaction'
import {
  SignTransactionPipelinePlugin,
  SignTransactionPipelineType,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import { SimulateTransactionPipeline } from 'stellar-plus/core/pipelines/simulate-transaction'
import {
  SimulateTransactionPipelinePlugin,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { SorobanGetTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-get-transaction'
import {
  SorobanGetTransactionPipelinePlugin,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOptions,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelinePlugin,
  SorobanTransactionPipelineType,
  SupportedInnerPlugins,
  TransactionExecutionOutput,
  TransactionSimulationOutput,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { SubmitTransactionPipeline } from 'stellar-plus/core/pipelines/submit-transaction'
import {
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon'
import { DefaultRpcHandler } from 'stellar-plus/rpc'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network } from 'stellar-plus/types'
import { MultiBeltPipeline } from 'stellar-plus/utils/pipeline/multi-belt-pipeline'
import { MultiBeltPipelineOptions } from 'stellar-plus/utils/pipeline/multi-belt-pipeline/types'

export class SorobanTransactionPipeline extends MultiBeltPipeline<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType,
  SupportedInnerPlugins
> {
  private rpcHandler: RpcHandler
  private horizonHandler: HorizonHandlerClient
  private networkConfig: Network

  constructor(options: SorobanTransactionPipelineOptions) {
    const internalConstructorArgs = {
      beltType: SorobanTransactionPipelineType.id,
      plugins: (options.plugins as SorobanTransactionPipelinePlugin[]) || [],
    } as MultiBeltPipelineOptions<
      SorobanTransactionPipelineInput,
      SorobanTransactionPipelineOutput,
      SorobanTransactionPipelineType,
      SupportedInnerPlugins
    >

    super({
      ...internalConstructorArgs,
      ...{ type: SorobanTransactionPipelineType.id },
    })

    this.networkConfig = options.networkConfig
    this.horizonHandler = new HorizonHandlerClient(this.networkConfig)
    this.rpcHandler = options.customRpcHandler || new DefaultRpcHandler(this.networkConfig)
  }

  protected async process(
    item: SorobanTransactionPipelineInput,
    itemId: string
  ): Promise<SorobanTransactionPipelineOutput> {
    const { txInvocation, operations, options }: SorobanTransactionPipelineInput = item
    const executionPlugins = []
    if (options?.executionPlugins) executionPlugins.push(...options.executionPlugins)

    // ======================= Build Transaction ==========================

    const buildTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'BuildTransactionPipeline' as BuildTransactionPipelineType
    ) as BuildTransactionPipelinePlugin[]

    const builTransactionPipeline = new BuildTransactionPipeline(buildTransactionPipelinePlugins)

    const builtTx = await builTransactionPipeline.execute(
      {
        header: txInvocation.header,
        horizonHandler: this.horizonHandler,
        operations,
        networkPassphrase: this.networkConfig.networkPassphrase,
      },
      itemId
    )

    // ======================= Simulate Transaction ==========================
    const simulateTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'SimulateTransactionPipeline' as SimulateTransactionPipelineType
    ) as SimulateTransactionPipelinePlugin[]

    const simulateTransactionPipeline = new SimulateTransactionPipeline(simulateTransactionPipelinePlugins)

    const successfulSimulation = await simulateTransactionPipeline.execute(
      {
        transaction: builtTx,
        rpcHandler: this.rpcHandler,
      },
      itemId
    )

    if (options?.simulateOnly) {
      return successfulSimulation as TransactionSimulationOutput
    }

    // ======================= Assemble ==========================
    const assembledTransaction = SorobanRpc.assembleTransaction(builtTx, successfulSimulation.response).build()

    // ======================= Calculate classic requirements ==========================
    const classicSignRequirementsPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType
    ) as ClassicSignRequirementsPipelinePlugin[]

    const classicSignRequirementsPipeline = new ClassicSignRequirementsPipeline(classicSignRequirementsPipelinePlugins)

    const classicSignatureRequirements = await classicSignRequirementsPipeline.execute(assembledTransaction, itemId)

    // ======================= Sign Transaction ==========================
    const signTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'SignTransactionPipeline' as SignTransactionPipelineType
    ) as SignTransactionPipelinePlugin[]

    const signTransactionPipeline = new SignTransactionPipeline(signTransactionPipelinePlugins)
    const signedTransaction = await signTransactionPipeline.execute(
      {
        transaction: assembledTransaction,
        signatureRequirements: classicSignatureRequirements,
        signers: txInvocation.signers,
      },
      itemId
    )

    // ======================= Submit Transaction ==========================
    const submitTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'SubmitTransactionPipeline' as SubmitTransactionPipelineType
    ) as SubmitTransactionPipelinePlugin[]

    const submitTransactionPipeline = new SubmitTransactionPipeline(submitTransactionPipelinePlugins)

    const submissionResult = await submitTransactionPipeline.execute(
      {
        transaction: signedTransaction,
        networkHandler: this.rpcHandler,
      },
      itemId
    )

    // ======================= Submission Follow Up ==========================
    const sorobanGetTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'SorobanGetTransactionPipeline' as SorobanGetTransactionPipelineType
    ) as SorobanGetTransactionPipelinePlugin[]

    const sorobanGetTransactionPipeline = new SorobanGetTransactionPipeline(sorobanGetTransactionPipelinePlugins)

    const sorobanGetTransactionResult = await sorobanGetTransactionPipeline.execute(
      {
        sorobanSubmission: submissionResult.response as SorobanRpc.Api.SendTransactionResponse,
        rpcHandler: this.rpcHandler,
        transactionEnvelope: signedTransaction,
      },
      itemId
    )

    return sorobanGetTransactionResult as TransactionExecutionOutput
  }
}
