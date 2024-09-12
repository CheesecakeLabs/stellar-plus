import { ClassicAssetHandler } from 'stellar-plus/asset'
import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelineOptions,
  ClassicTransactionPipelineOutput,
} from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { NetworkConfig } from 'stellar-plus/types'

export type ClassicLiquidityPool = {
  assetA: ClassicAssetHandler
  assetB: ClassicAssetHandler
}

export type ClassicLiquidityPoolHandler = ClassicLiquidityPool

export type ClassicLiquidityPoolHandlerConstructorArgs = {
  assetA: ClassicAssetHandler
  assetB: ClassicAssetHandler
  networkConfig: NetworkConfig

  options?: {
    classicTransactionPipeline?: ClassicTransactionPipelineOptions
  }
}

export type ClassicLiquidityPoolHandlerInstanceArgs = {
  liquidityPoolId: string
  networkConfig: NetworkConfig

  options?: {
    classicTransactionPipeline?: ClassicTransactionPipelineOptions
  }
}

export type ClassicUtils = {
  createTrustline: (args: { to: string } & BaseInvocation) => Promise<ClassicTransactionPipelineOutput>
}

export type BaseInvocation = TransactionInvocation & {
  options?: ClassicTransactionPipelineInput['options']
}
