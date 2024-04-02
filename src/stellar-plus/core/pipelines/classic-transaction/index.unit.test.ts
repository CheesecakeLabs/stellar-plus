import exp from 'constants'
import { Constants } from 'stellar-plus'
import { BuildTransactionPipeline } from 'stellar-plus/core/pipelines/build-transaction'
import { ClassicSignRequirementsPipeline } from 'stellar-plus/core/pipelines/classic-sign-requirements'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import {
  ClassicTransactionPipelineInput,
  ClassicTransactionPipelinePlugin,
  ClassicTransactionPipelineType,
  SupportedInnerPlugins,
} from 'stellar-plus/core/pipelines/classic-transaction/types'
import { SignTransactionPipeline } from 'stellar-plus/core/pipelines/sign-transaction'
import { SubmitTransactionPipeline } from 'stellar-plus/core/pipelines/submit-transaction'
import { TransactionInvocation } from 'stellar-plus/types'
import { ClassicChannelAccountsPlugin } from 'stellar-plus/utils/pipeline/plugins/classic-transaction/channel-accounts'
import { DebugPlugin } from 'stellar-plus/utils/pipeline/plugins/generic/debug'
import { FeeBumpWrapperPlugin } from 'stellar-plus/utils/pipeline/plugins/submit-transaction/fee-bump'
import { BuildTransactionPipelinePlugin, BuildTransactionPipelineType } from '../build-transaction/types'
import {
  ClassicSignRequirementsPipelinePlugin,
  ClassicSignRequirementsPipelineType,
} from '../classic-sign-requirements/types'
import { SignTransactionPipelinePlugin, SignTransactionPipelineType } from '../sign-transaction/types'
import { SubmitTransactionPipelinePlugin, SubmitTransactionPipelineType } from '../submit-transaction/types'

jest.mock('stellar-plus/core/pipelines/build-transaction', () => ({
  BuildTransactionPipeline: jest.fn().mockImplementation(() => ({
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
    execute: jest.fn(),
  })),
}))

const MOCKED_BUILD_TRANSACTION_PIPELINE = BuildTransactionPipeline as jest.Mock
const MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE = ClassicSignRequirementsPipeline as jest.Mock
const MOCKED_SIGN_TRANSACTION_PIPELINE = SignTransactionPipeline as jest.Mock
const MOCKED_SUBMIT_TRANSACTION_PIPELINE = SubmitTransactionPipeline as jest.Mock

const MOCKED_PLUGIN_BASE = {
  preProcess: jest.fn(),
  postProcess: jest.fn(),
}

const MOCKED_BUILD_TRANSACTION_PLUGIN = jest.mocked({
  ...MOCKED_PLUGIN_BASE,
  type: 'BuildTransactionPipeline' as BuildTransactionPipelineType,
}) as unknown as BuildTransactionPipelinePlugin

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

const TESTNET_NETWORK_CONFIG = Constants.testnet

const MOCKED_TX_INVOCATION: TransactionInvocation = {
  header: {
    source: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
    fee: '100',
    timeout: 100,
  },
  signers: [],
}

const MOCKED_PIPELINE_ITEM: ClassicTransactionPipelineInput = {
  operations: [],
  txInvocation: MOCKED_TX_INVOCATION,
}

describe('Classic Transaction Pipeline', () => {
  describe('Initialize', () => {
    it('should initialize the Classic Transaction Pipeline', () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with no plugins', () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [],
      })

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with generic plugins', () => {
      const debugPlugin = new DebugPlugin('error')
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [debugPlugin as ClassicTransactionPipelinePlugin],
      })

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with classic transaction pipeline plugins', () => {
      const channelAccountsPlugin = new ClassicChannelAccountsPlugin({ channels: [] })
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [channelAccountsPlugin],
      })

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with classic transaction internal pipelines plugins', () => {
      const feeBumpWrapperPlugin = new FeeBumpWrapperPlugin(MOCKED_TX_INVOCATION)
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [feeBumpWrapperPlugin],
      })

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with multiple plugin types', () => {
      const debugPlugin = new DebugPlugin('error')
      const feeBumpWrapperPlugin = new FeeBumpWrapperPlugin(MOCKED_TX_INVOCATION)
      const channelAccountsPlugin = new ClassicChannelAccountsPlugin({ channels: [] })
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [debugPlugin as ClassicTransactionPipelinePlugin, feeBumpWrapperPlugin, channelAccountsPlugin],
      })

      expect(pipeline).toBeInstanceOf(ClassicTransactionPipeline)
      expect(pipeline.type).toEqual(ClassicTransactionPipelineType.id)
    })

    it('should initialize the Classic Transaction Pipeline with build transaction pipeline plugins', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_BUILD_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_BUILD_TRANSACTION_PLUGIN])
    })

    it('should initialize the Classic Transaction Pipeline with classic sign requirements pipeline plugins', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledWith([MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN])
    })

    it('should initialize the Classic Transaction Pipeline with sign transaction pipeline plugins', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SIGN_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIGN_TRANSACTION_PLUGIN])
    })

    it('should initialize the Classic Transaction Pipeline with submit transaction pipeline plugins', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG, {
        plugins: [MOCKED_SUBMIT_TRANSACTION_PLUGIN],
      })

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SUBMIT_TRANSACTION_PLUGIN])
    })
  })

  describe('Core functionalities', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should execute each internal transaction pipeline once', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
    })

    it('should execute each internal transaction pipeline in order', async () => {
      const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)

      await pipeline.execute(MOCKED_PIPELINE_ITEM)

      expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledAfter(MOCKED_BUILD_TRANSACTION_PIPELINE)
      expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE)
      expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledAfter(MOCKED_SIGN_TRANSACTION_PIPELINE)
    })
  })

  it('should process the Input into an Output', async () => {
    MOCKED_SUBMIT_TRANSACTION_PIPELINE.mockImplementationOnce(() => ({
      execute: jest.fn().mockResolvedValueOnce('output'),
    }))
    const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processSpy = jest.spyOn(pipeline as any, 'process')

    const result = await pipeline.execute(MOCKED_PIPELINE_ITEM, '0')

    expect(processSpy).toHaveBeenCalledOnce()
    expect(processSpy).toHaveBeenCalledWith(MOCKED_PIPELINE_ITEM, '0')
    expect(processSpy).toHaveBeenCalledExactlyOnceWith(MOCKED_PIPELINE_ITEM, '0')
    expect(result).toEqual('output')
  })

  it('should accept build transaction pipeline execution plugins', async () => {
    const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)
    const executionPlugins = [MOCKED_BUILD_TRANSACTION_PLUGIN]
    const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

    await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

    expect(MOCKED_BUILD_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_BUILD_TRANSACTION_PLUGIN])
  })

  it('should accept classic sign requirements pipeline execution plugins', async () => {
    const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)
    const executionPlugins = [MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN]
    const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

    await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

    expect(MOCKED_CLASSIC_SIGN_REQUIREMENTS_PIPELINE).toHaveBeenCalledWith([MOCKED_CLASSIC_SIGN_REQUIREMENTS_PLUGIN])
  })

  it('should accept sign transaction pipeline execution plugins', async () => {
    const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)
    const executionPlugins = [MOCKED_SIGN_TRANSACTION_PLUGIN]
    const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

    await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

    expect(MOCKED_SIGN_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SIGN_TRANSACTION_PLUGIN])
  })

  it('should accept submit transaction pipeline execution plugins', async () => {
    const pipeline = new ClassicTransactionPipeline(TESTNET_NETWORK_CONFIG)
    const executionPlugins = [MOCKED_SUBMIT_TRANSACTION_PLUGIN]
    const MOCKED_ITEM_WITH_PLUGINS = { ...MOCKED_PIPELINE_ITEM, options: { executionPlugins } }

    await pipeline.execute(MOCKED_ITEM_WITH_PLUGINS)

    expect(MOCKED_SUBMIT_TRANSACTION_PIPELINE).toHaveBeenCalledWith([MOCKED_SUBMIT_TRANSACTION_PLUGIN])
  })
})
