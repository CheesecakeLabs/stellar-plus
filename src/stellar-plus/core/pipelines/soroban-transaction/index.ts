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
  SorobanTransactionPipelineMainPlugin,
  SorobanTransactionPipelineOptions,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelinePlugin,
  SorobanTransactionPipelineType,
  SupportedInnerPlugins,
  SupportedInnerPluginsTypes,
  listOfSupportedInnerPluginsTypes,
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
import { GenericPlugin } from 'stellar-plus/utils/pipeline/conveyor-belts/types'
import { filterPluginsByTypes } from 'stellar-plus/utils/pipeline/plugins'

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
  private innerPlugins: SupportedInnerPlugins[]

  constructor(options: SorobanTransactionPipelineOptions) {
    const mainPlugins = filterPluginsByTypes<
      SorobanTransactionPipelinePlugin,
      SorobanTransactionPipelineType | GenericPlugin
    >(options.plugins || [], ['SorobanTransactionPipeline', 'GenericPlugin']) as
      | SorobanTransactionPipelineMainPlugin[]
      | undefined

    super({
      type: 'SorobanTransactionPipeline',
      plugins: mainPlugins || [],
    })

    const innerPlugins = filterPluginsByTypes<SorobanTransactionPipelinePlugin, SupportedInnerPluginsTypes>(
      options.plugins || [],
      listOfSupportedInnerPluginsTypes
    ) as SupportedInnerPlugins[] | undefined

    this.innerPlugins = innerPlugins || []

    this.networkConfig = options.networkConfig
    this.horizonHandler = new HorizonHandlerClient(this.networkConfig)
    this.rpcHandler = options.customRpcHandler || new DefaultRpcHandler(this.networkConfig)
  }

  protected async process(
    item: SorobanTransactionPipelineInput,
    itemId: string
  ): Promise<SorobanTransactionPipelineOutput> {
    const { txInvocation, operations, options }: SorobanTransactionPipelineInput = item
    const innerPlugins = [...this.innerPlugins]
    if (options?.innerPlugins) innerPlugins.push(...options.innerPlugins)

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

    return sorobanGetTransactionResult as SorobanTransactionPipelineOutput
  }

  private getInnerPlugins(plugins: SupportedInnerPlugins[], pipelineType: any): SupportedInnerPlugins[] {
    return filterPluginsByTypes<SupportedInnerPlugins, typeof pipelineType>(plugins, [pipelineType, 'GenericPlugin'])
  }
}
