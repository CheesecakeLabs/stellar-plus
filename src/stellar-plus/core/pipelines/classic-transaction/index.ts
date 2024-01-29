import { BuildTransactionPipeline } from 'stellar-plus/core/pipelines/build-transaction'
import { ClassicSignRequirementsPipeline } from 'stellar-plus/core/pipelines/classic-sign-requirements'
import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOptions,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelinePlugin,
  ClassicTransactionPipelineType,
  SupportedInnerPlugins,
} from 'stellar-plus/core/pipelines/classic-transaction/types'
import { SignTransactionPipeline } from 'stellar-plus/core/pipelines/sign-transaction'
import {
  SignTransactionPipelinePlugin,
  SignTransactionPipelineType,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import { SubmitTransactionPipeline } from 'stellar-plus/core/pipelines/submit-transaction'
import {
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon'
import { Network } from 'stellar-plus/types'
import { MultiBeltPipeline } from 'stellar-plus/utils/pipeline/multi-belt-pipeline'
import { MultiBeltPipelineOptions } from 'stellar-plus/utils/pipeline/multi-belt-pipeline/types'

import { BuildTransactionPipelinePlugin, BuildTransactionPipelineType } from '../build-transaction/types'
import {
  ClassicSignRequirementsPipelinePlugin,
  ClassicSignRequirementsPipelineType,
} from '../classic-sign-requirements/types'

export class ClassicTransactionPipeline extends MultiBeltPipeline<
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineType,
  SupportedInnerPlugins
> {
  private horizonHandler: HorizonHandlerClient
  private networkConfig: Network

  constructor(options: ClassicTransactionPipelineOptions) {
    const internalConstructorArgs = {
      beltType: ClassicTransactionPipelineType.id,
      plugins: (options.plugins as ClassicTransactionPipelinePlugin[]) || [],
    } as MultiBeltPipelineOptions<
      ClassicTransactionPipelineInput,
      ClassicTransactionPipelineOutput,
      ClassicTransactionPipelineType,
      SupportedInnerPlugins
    >

    super({
      ...internalConstructorArgs,
      ...{ type: ClassicTransactionPipelineType.id },
    })

    this.networkConfig = options.networkConfig
    this.horizonHandler = new HorizonHandlerClient(this.networkConfig)
  }

  protected async process(
    item: ClassicTransactionPipelineInput,
    itemId: string
  ): Promise<ClassicTransactionPipelineOutput> {
    const { txInvocation, operations, options }: ClassicTransactionPipelineInput = item
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

    // ======================= Calculate classic requirements ==========================
    const classicSignRequirementsPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType
    ) as ClassicSignRequirementsPipelinePlugin[]

    const classicSignRequirementsPipeline = new ClassicSignRequirementsPipeline(classicSignRequirementsPipelinePlugins)

    const classicSignatureRequirements = await classicSignRequirementsPipeline.execute(builtTx, itemId)

    // ======================= Sign Transaction ==========================
    const signTransactionPipelinePlugins = this.getInnerPluginsByType(
      executionPlugins,
      'SignTransactionPipeline' as SignTransactionPipelineType
    ) as SignTransactionPipelinePlugin[]

    const signTransactionPipeline = new SignTransactionPipeline(signTransactionPipelinePlugins)
    const signedTransaction = await signTransactionPipeline.execute(
      {
        transaction: builtTx,
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
        networkHandler: this.horizonHandler,
      },
      itemId
    )

    return submissionResult as ClassicTransactionPipelineOutput
  }
}
