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
import { SorobanAuthPipeline } from 'stellar-plus/core/pipelines/soroban-auth'
import { SorobanAuthPipelinePlugin, SorobanAuthPipelineType } from 'stellar-plus/core/pipelines/soroban-auth/types'
import { SorobanGetTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-get-transaction'
import {
  SorobanGetTransactionPipelineConstructor,
  SorobanGetTransactionPipelinePlugin,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelinePlugin,
  SorobanTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { SubmitTransactionPipeline } from 'stellar-plus/core/pipelines/submit-transaction'
import {
  SubmitTransactionPipelinePlugin,
  SubmitTransactionPipelineType,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { TestNet } from 'stellar-plus/network'
import { TransactionInvocation } from 'stellar-plus/types'
import { DebugPlugin } from 'stellar-plus/utils/pipeline/plugins/generic/debug'
import { SorobanChannelAccountsPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-transaction/channel-accounts'
import { FeeBumpWrapperPlugin } from 'stellar-plus/utils/pipeline/plugins/submit-transaction/fee-bump'

jest.mock('stellar-plus/core/pipelines/build-transaction', () => ({
  BuildTransactionPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}))

jest.mock('stellar-plus/core/pipelines/simulate-transaction', () => ({
  SimulateTransactionPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      assembledTransaction: 'assembledTransaction',
    }),
  })),
}))

jest.mock('stellar-plus/core/pipelines/soroban-auth', () => ({
  SorobanAuthPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}))

jest.mock('stellar-plus/core/pipelines/classic-sign-requirements', () => ({
  ClassicSignRequirementsPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}))

jest.mock('stellar-plus/core/pipelines/sign-transaction', () => ({
  SignTransactionPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}))

jest.mock('stellar-plus/core/pipelines/submit-transaction', () => ({
  SubmitTransactionPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      response: jest.fn(),
    }),
  })),
}))

jest.mock('stellar-plus/core/pipelines/soroban-get-transaction', () => ({
  SorobanGetTransactionPipeline: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}))

const MOCKED_BUILD_TRANSACTION_PIPELINE = BuildTransactionPipeline as jest.Mock
const MOCKED_SIMULATE_TRANSACTION_PIPELINE = SimulateTransactionPipeline as jest.Mock
const MOCKED_SOROBAN_AUTH_PIPELINE = SorobanAuthPipeline as jest.Mock
const MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE = ClassicSignRequirementsPipeline as jest.Mock
const MOCKED_SIGN_TRANSACTION_PIPELINE = SignTransactionPipeline as jest.Mock
const MOCKED_SUBMIT_TRANSACTION_PIPELINE = SubmitTransactionPipeline as jest.Mock
const MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE = SorobanGetTransactionPipeline as jest.Mock

const MOCKED_PLUGIN_BASE = {
  preProcess: jest.fn(),
  postProcess: jest.fn(),
}

const MOCKED_BUILD_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'BuildTransactionPipeline' as BuildTransactionPipelineType,
}) as unknown as BuildTransactionPipelinePlugin

const MOCKED_SIMULATE_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'SimulateTransactionPipeline' as SimulateTransactionPipelineType,
}) as unknown as SimulateTransactionPipelinePlugin

const MOCKED_SOROBAN_AUTH_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'SorobanAuthPipeline' as SorobanAuthPipelineType,
}) as unknown as SorobanAuthPipelinePlugin

const MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'ClassicSignRequirementsPipeline' as ClassicSignRequirementsPipelineType,
}) as unknown as ClassicSignRequirementsPipelinePlugin

const MOCKED_SIGN_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'SignTransactionPipeline' as SignTransactionPipelineType,
}) as unknown as SignTransactionPipelinePlugin

const MOCKED_SUBMIT_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'SubmitTransactionPipeline' as SubmitTransactionPipelineType,
}) as unknown as SubmitTransactionPipelinePlugin

const MOCKED_SOROBAN_GET_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'SorobanGetTransactionPipeline' as SorobanGetTransactionPipelineType,
}) as unknown as SorobanGetTransactionPipelinePlugin

const TESTNET_NETWORK_CONFIG = TestNet()

const MOCKED_TX_INVOCATION: TransactionInvocation = {
  header: {
    source: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
    fee: '100',
    timeout: 100,
  },
  signers: [],
}

const MOCKED_PIPELINE_ITEM: SorobanTransactionPipelineInput = {
  operations: [],
  txInvocation: MOCKED_TX_INVOCATION,
}

describe('Soroban Transaction Pipeline', () => {
  describe('Initialize', () => {
    it('should initialize the Soroban Transaction Pipeline', () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with no plugins', () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [],
      })

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with generic plugins', () => {
      const debugPlugin = new DebugPlugin('error')
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [debugPlugin as SorobanTransactionPipelinePlugin],
      })

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with Soroban transaction pipeline plugins', () => {
      const channelAccountsPlugin = new SorobanChannelAccountsPlugin({ channels: [] })
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [channelAccountsPlugin],
      })

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with Soroban transaction internal pipelines plugins', () => {
      const feeBumpWrapperPlugin = new FeeBumpWrapperPlugin(MOCKED_TX_INVOCATION)
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [feeBumpWrapperPlugin],
      })

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with multiple plugin types', () => {
      const debugPlugin = new DebugPlugin('error')
      const feeBumpWrapperPlugin = new FeeBumpWrapperPlugin(MOCKED_TX_INVOCATION)
      const channelAccountsPlugin = new SorobanChannelAccountsPlugin({ channels: [] })
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [debugPlugin as SorobanTransactionPipelinePlugin, feeBumpWrapperPlugin, channelAccountsPlugin],
      })

      expect(pipeline).toBeInstanceOf(SorobanTransactionPipeline)
      expect(pipeline.type).toEqual(SorobanTransactionPipelineType.id)
    })

    it('should initialize the Soroban Transaction Pipeline with build transaction pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_BUILD_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_BUILD_TRANSACTION_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with simulate transaction pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SIMULATE_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIMULATE_TRANSACTION_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with Soroban auth pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SOROBAN_AUTH_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SOROBAN_AUTH_PIPELINE).toHaveBeenCalledWith([MOCKED_SOROBAN_AUTH_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with Soroban sign requirements pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledWith([MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with sign transaction pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SIGN_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIGN_TRANSACTION_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with submit transaction pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SUBMIT_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SUBMIT_TRANSACTION_PLUGIN])
    })

    it('should initialize the Soroban Transaction Pipeline with get transaction pipeline plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SOROBAN_GET_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE).toHaveBeenCalledWith({
        plugins: [MOCKED_SOROBAN_GET_TRANSACTION_PLUGIN],
      } as SorobanGetTransactionPipelineConstructor)
    })
  })
  describe('Core functionalities', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should execute each internal transaction pipeline once', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SOROBAN_AUTH_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
    })

    it('should execute each internal transaction pipeline in order', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_BUILD_TRANSACTION_PIPELINE)
      expect(MOCKED_SOROBAN_AUTH_PIPELINE).toHaveBeenCalledAfter(MOCKED_SIMULATE_TRANSACTION_PIPELINE)
      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledAfter(MOCKED_SOROBAN_AUTH_PIPELINE)
      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE)
      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_SIGN_TRANSACTION_PIPELINE)
      expect(MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_SUBMIT_TRANSACTION_PIPELINE)
    })

    it('should process the Input into an Output', async () => {
      MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE.mockImplementationOnce(() => ({
        execute: jest.fn().mockResolvedValueOnce('output'),
      }))
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processSpy = jest.spyOn(pipeline as any, 'process')

      const result = await pipeline.execute(MOCKED_PIPELINE_ITEM, '0')

      expect(processSpy).toHaveBeenCalledOnce()
      expect(processSpy).toHaveBeenCalledWith(MOCKED_PIPELINE_ITEM, '0')
      expect(processSpy).toHaveBeenCalledExactlyOnceWith(MOCKED_PIPELINE_ITEM, '0')
      expect(result).toEqual('output')
    })

    it('should process the Input into a simulation Output when simulateOnly flag is set', async () => {
      MOCKED_SIMULATE_TRANSACTION_PIPELINE.mockImplementationOnce(() => ({
        execute: jest.fn().mockResolvedValueOnce('output'),
      }))
      const MOCKED_SIMULATION_ITEM = { ...MOCKED_PIPELINE_ITEM, options: { simulateOnly: true } }
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processSpy = jest.spyOn(pipeline as any, 'process')

      const result = await pipeline.execute(MOCKED_SIMULATION_ITEM, '0')

      expect(processSpy).toHaveBeenCalledOnce()
      expect(processSpy).toHaveBeenCalledWith(MOCKED_SIMULATION_ITEM, '0')
      expect(processSpy).toHaveBeenCalledExactlyOnceWith(MOCKED_SIMULATION_ITEM, '0')
      expect(result).toEqual('output')
    })

    it('should accept build transaction pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_BUILD_TRANSACTION_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_BUILD_TRANSACTION_PLUGIN])
    })

    it('should accept simulate transaction pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_SIMULATE_TRANSACTION_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIMULATE_TRANSACTION_PLUGIN])
    })

    it('should accept Soroban auth pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_SOROBAN_AUTH_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_SOROBAN_AUTH_PIPELINE).toHaveBeenCalledWith([MOCKED_SOROBAN_AUTH_PLUGIN])
    })

    it('should accept classic sign requirements pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledWith([MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN])
    })

    it('should accept sign transaction pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_SIGN_TRANSACTION_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIGN_TRANSACTION_PLUGIN])
    })

    it('should accept submit transaction pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_SUBMIT_TRANSACTION_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SUBMIT_TRANSACTION_PLUGIN])
    })

    it('should accept get transaction pipeline execution plugins', async () => {
      const pipeline = new SorobanTransactionPipeline(TESTNET_NETWORK_CONFIG)
      const executionPlugins = [MOCKED_SOROBAN_GET_TRANSACTION_PLUGIN]
      const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

      await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

      expect(MOCKED_SOROBAN_GET_TRANSACTION_PIPELINE).toHaveBeenCalledWith({
        plugins: [MOCKED_SOROBAN_GET_TRANSACTION_PLUGIN],
      } as SorobanGetTransactionPipelineConstructor)
    })
  })
})
