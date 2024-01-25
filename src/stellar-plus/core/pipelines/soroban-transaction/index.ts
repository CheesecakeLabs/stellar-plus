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
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelinePlugin,
  SorobanTransactionPipelineSupportedInnerPlugins,
  SorobanTransactionPipelineType,
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
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { filterPluginsByType } from 'stellar-plus/utils/pipeline/plugins'

import {
  SorobanGetTransactionPipelinePlugin,
  SorobanGetTransactionPipelineType,
} from '../soroban-get-transaction/types'

export class SorobanTransactionPipeline extends ConveyorBelt<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType
> {
  private rpcHandler: RpcHandler
  private horizonHandler: HorizonHandlerClient
  private networkConfig: Network

  constructor(options: {
    plugins?: SorobanTransactionPipelinePlugin[]
    networkConfig: Network
    customRpcHandler?: RpcHandler
  }) {
    super({
      type: 'SorobanTransactionPipeline',
      plugins: options.plugins || [],
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
    const innerPlugins = options?.innerPlugins || []

    // ======================= Build Transaction ==========================
    const buildTransactionPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
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
    const simulateTransactionPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
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

    // ======================= Assemble ==========================
    const assembledTransaction = SorobanRpc.assembleTransaction(builtTx, successfulSimulation).build()

    // ======================= Calculate classic requirements ==========================
    const classicSignRequirementsPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
      'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType
    ) as ClassicSignRequirementsPipelinePlugin[]

    const classicSignRequirementsPipeline = new ClassicSignRequirementsPipeline(classicSignRequirementsPipelinePlugins)

    const classicSignatureRequirements = await classicSignRequirementsPipeline.execute(assembledTransaction, itemId)

    // ======================= Sign Transaction ==========================
    const signTransactionPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
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
    const submitTransactionPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
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
    const sorobanGetTransactionPipelinePlugins = this.getInnerPlugins(
      innerPlugins,
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

    return {
      result: sorobanGetTransactionResult,
    } as SorobanTransactionPipelineOutput
  }

  private getInnerPlugins(
    plugins: SorobanTransactionPipelineSupportedInnerPlugins[],
    pipelineType: any
  ): SorobanTransactionPipelineSupportedInnerPlugins[] {
    return filterPluginsByType<SorobanTransactionPipelineSupportedInnerPlugins, typeof pipelineType>(
      plugins,
      pipelineType
    )
  }
}
