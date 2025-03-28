import { DefaultAccountHandler } from 'stellar-plus/account'
import { SACHandler } from 'stellar-plus/asset'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, SupportedImageVersions, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { ProfilerPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-transaction'
import { LogEntry } from 'stellar-plus/utils/profiler/profiling-handler/types'
import { simpleTxInvocation } from 'tests/utils'

describe('Profiler Plugin Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
    containerImageVersion: SupportedImageVersions.LASTEST,
  })

  let networkConfig: NetworkConfig
  let profilerPlugin: ProfilerPlugin
  let transactionCount: number

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const container = await stellarTestLedger.start()
    expect(container).toBeDefined()

    networkConfig = CustomNet(await stellarTestLedger.getNetworkConfiguration())
    expect(networkConfig.horizonUrl).toBeDefined()
    expect(networkConfig.networkPassphrase).toBeDefined()
    expect(networkConfig.rpcUrl).toBeDefined()
    expect(networkConfig.friendbotUrl).toBeDefined()
  })

  afterAll(async () => {
    await stellarTestLedger.stop()
    await stellarTestLedger.destroy()
  })

  it('should initialize a profiler plugin', () => {
    transactionCount = 0
    profilerPlugin = new ProfilerPlugin()

    expect(profilerPlugin).toBeDefined()
    expect(profilerPlugin.data.getLog()).toBeDefined()
    expect(profilerPlugin.data.getLog().length).toBe(transactionCount)
  })

  describe('Given an initialized profiler plugin', () => {
    let issuer: DefaultAccountHandler
    let asset: SACHandler

    beforeAll(async () => {
      issuer = new DefaultAccountHandler({ networkConfig })
      await issuer.initializeWithFriendbot()
      expect(issuer).toBeDefined()
    })

    it('should be accepted by a soroban pipeline as plugin', () => {
      asset = new SACHandler({
        code: 'SPLUS',
        issuerAccount: issuer,
        networkConfig,
        options: {
          sorobanTransactionPipeline: {
            plugins: [profilerPlugin],
          },
        },
      })

      expect(asset).toBeDefined()
      expect((asset as any).sorobanTokenHandler.sorobanTransactionPipeline.plugins.length).toBe(1)
      expect((asset as any).sorobanTokenHandler.sorobanTransactionPipeline.plugins).toStrictEqual([profilerPlugin])
    })

    it('should collect metrics of a soroban transaction', async () => {
      transactionCount += 1
      await asset.wrapAndDeploy(simpleTxInvocation(issuer))

      expect(profilerPlugin.data.getLog()).toBeDefined()
      expect(profilerPlugin.data.getLog().length).toBe(transactionCount)
    })

    it('should collect metrics of multiple soroban transaction', async () => {
      transactionCount += 3
      await asset.sorobanTokenHandler.transfer({
        to: issuer.getPublicKey(),
        from: issuer.getPublicKey(),
        amount: BigInt(10),
        ...simpleTxInvocation(issuer),
      })

      await asset.sorobanTokenHandler.transfer({
        to: issuer.getPublicKey(),
        from: issuer.getPublicKey(),
        amount: BigInt(5),
        ...simpleTxInvocation(issuer),
      })

      await asset.sorobanTokenHandler.transfer({
        to: issuer.getPublicKey(),
        from: issuer.getPublicKey(),
        amount: BigInt(10),
        ...simpleTxInvocation(issuer),
      })

      expect(profilerPlugin.data.getLog()).toBeDefined()
      expect(profilerPlugin.data.getLog().length).toBe(transactionCount)
    })

    it('should filter metrics from the collected data', async () => {
      expect(profilerPlugin.data.getLog({ filter: { methods: ['createContract'] } }).length).toBe(1)
    })

    it('should aggregate metrics from the collected data', async () => {
      expect(
        (profilerPlugin.data.getLog({ aggregate: { feeCharged: { method: 'sum' } } })[0] as LogEntry).feeCharged
      ).toBeWithin(800000, 900000)
    })

    it('should filter and aggregate metrics from the collected data', async () => {
      expect(
        (
          profilerPlugin.data.getLog({
            filter: { methods: ['createContract'] },
            aggregate: { feeCharged: { method: 'sum' } },
          })[0] as LogEntry
        ).feeCharged
      ).toBeWithin(700000, 800000)
    })

    it('should clear the logs', () => {
      transactionCount = 0

      profilerPlugin.data.clearLog()

      expect(profilerPlugin.data.getLog().length).toBe(transactionCount)
    })
  })
})
