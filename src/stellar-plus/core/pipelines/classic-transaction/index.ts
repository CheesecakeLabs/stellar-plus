import { BuildTransactionPipeline } from 'stellar-plus/core/pipelines/build-transaction'
import { ClassicSignRequirementsPipeline } from 'stellar-plus/core/pipelines/classic-sign-requirements'
import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOptions,
  ClassicTransactionPipelineOutput,
  ClassicTransactionPipelineOutputSimple,
  ClassicTransactionPipelineOutputVerbose,
  ClassicTransactionPipelinePlugin,
  ClassicTransactionPipelineType,
  SupportedInnerPlugins,
  VerboseOutput,
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
import { NetworkConfig } from 'stellar-plus/types'
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
  private networkConfig: NetworkConfig

  constructor(networkConfig: NetworkConfig, options?: ClassicTransactionPipelineOptions) {
    const internalConstructorArgs = {
      beltType: ClassicTransactionPipelineType.id,
      plugins: (options?.plugins as ClassicTransactionPipelinePlugin[]) || [],
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

    this.networkConfig = networkConfig
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

    if (this.isSimpleOutput(options)) {
      return submissionResult as ClassicTransactionPipelineOutputSimple
    }

    const verboseOutput = options?.verboseOutput
      ? ({
          buildTransactionPipelineOutput: builtTx,
          classicSignRequirementsPipelineOutput: classicSignatureRequirements,
          signTransactionPipelineOutput: signedTransaction,
          submitTransactionPipelineOutput: submissionResult,
        } as VerboseOutput)
      : {}

    return {
      ...verboseOutput,
      classicTransactionOutput: submissionResult as ClassicTransactionPipelineOutputSimple,
      hash: options?.includeHashOutput ? submissionResult.response.hash : undefined,
    } as ClassicTransactionPipelineOutputVerbose
  }

  // expand with other options in the future that might require verbose output
  protected isSimpleOutput(options: ClassicTransactionPipelineInput['options']): boolean {
    return !options?.includeHashOutput && !options?.verboseOutput
  }
}
