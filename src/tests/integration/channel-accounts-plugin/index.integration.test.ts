import { DefaultAccountHandler } from 'stellar-plus/account'
import { ClassicAssetHandler, SACHandler } from 'stellar-plus/asset'
import { ChannelAccounts } from 'stellar-plus/channel-accounts'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { ClassicChannelAccountsPlugin } from 'stellar-plus/utils/pipeline/plugins/classic-transaction/channel-accounts'
import { SorobanChannelAccountsPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-transaction/channel-accounts'
import { FeeBumpWrapperPlugin } from 'stellar-plus/utils/pipeline/plugins/submit-transaction/fee-bump'
import { contractIdRegex } from 'stellar-plus/utils/regex'
import { simpleTxInvocation, simpleTxInvocationToFeebump } from 'tests/utils'

describe('Channel Accounts Plugin Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
  })

  let networkConfig: NetworkConfig
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

  describe('Given an issuer with lumens and a user', () => {
    let issuer: DefaultAccountHandler
    let user: DefaultAccountHandler
    let userExpectedBalance: number
    let channels: DefaultAccountHandler[]
    let classicCAPlugin: ClassicChannelAccountsPlugin
    let sorobanCAPlugin: SorobanChannelAccountsPlugin
    let feeBumpPlugin: FeeBumpWrapperPlugin

    beforeAll(async () => {
      issuer = new DefaultAccountHandler({ networkConfig })
      user = new DefaultAccountHandler({ networkConfig })
      await issuer.initializeWithFriendbot()
      await user.initializeWithFriendbot()
      userExpectedBalance = 0
    })

    it('Can use the channel accounts helper tool to initiate 10 channels', async () => {
      channels = await ChannelAccounts.openChannels({
        networkConfig,
        numberOfChannels: 10,
        txInvocation: simpleTxInvocation(issuer),
        sponsor: issuer,
      })

      expect(channels.length).toBe(10)
    })

    it('Can prepare a FeebumpWrapper plugin to cover all fees', async () => {
      const feebumpHeader = simpleTxInvocationToFeebump(simpleTxInvocation(issuer))
      feeBumpPlugin = new FeeBumpWrapperPlugin(feebumpHeader)

      expect(feeBumpPlugin).toBeDefined()
    })

    describe('A Classic Asset Handler initialized with the issuer account handler and the plugin', () => {
      let classicAsset: ClassicAssetHandler

      beforeAll(async () => {
        classicCAPlugin = new ClassicChannelAccountsPlugin({ channels })
        expect(classicCAPlugin).toBeDefined()

        classicAsset = new ClassicAssetHandler({
          code: 'SPLUSCLA',
          issuerAccount: issuer,
          networkConfig,
          options: {
            classicTransactionPipeline: {
              plugins: [classicCAPlugin, feeBumpPlugin],
            },
          },
        })
        expect(classicAsset).toBeDefined()
      })

      it('should be able to use the channels to run an add trustline and mint transaction', async () => {
        userExpectedBalance += 100

        await expect(
          classicAsset.addTrustlineAndMint({ to: user.getPublicKey(), amount: 100, ...simpleTxInvocation(user) })
        ).toResolve()
        await expect(classicAsset.balance(user.getPublicKey())).resolves.toBe(userExpectedBalance)
      })

      it('should be able to use the channels to run 50 mint transactions in parallel', async () => {
        const promises = []
        userExpectedBalance += 10 * 50

        for (let i = 0; i < 50; i++) {
          promises.push(
            expect(
              classicAsset.mint({
                to: user.getPublicKey(),
                amount: 10,
                ...simpleTxInvocation(issuer),
              })
            ).toResolve()
          )
        }
        await Promise.all(promises)

        await expect(classicAsset.balance(user.getPublicKey())).resolves.toBe(userExpectedBalance)
      })
    })

    describe('A SAC Asset Handler initialized with the issuer account handler and the plugin', () => {
      let sacAsset: SACHandler

      beforeAll(async () => {
        userExpectedBalance = 0

        classicCAPlugin = new ClassicChannelAccountsPlugin({ channels })
        sorobanCAPlugin = new SorobanChannelAccountsPlugin({ channels })
        expect(classicCAPlugin).toBeDefined()
        expect(sorobanCAPlugin).toBeDefined()

        sacAsset = new SACHandler({
          code: 'SPLUSSAC',
          issuerAccount: issuer,
          networkConfig,
          options: {
            classicTransactionPipeline: {
              plugins: [classicCAPlugin, feeBumpPlugin],
            },
            sorobanTransactionPipeline: {
              plugins: [sorobanCAPlugin, feeBumpPlugin],
            },
          },
        })
        expect(sacAsset).toBeDefined()
      })

      it('should be able to use the channels to run an add trustline and mint transaction', async () => {
        userExpectedBalance += 100

        await expect(
          sacAsset.classicHandler.addTrustlineAndMint({
            to: user.getPublicKey(),
            amount: 100,
            ...simpleTxInvocation(user),
          })
        ).toResolve()
        await expect(sacAsset.classicHandler.balance(user.getPublicKey())).resolves.toBe(userExpectedBalance)
      })

      it('should be able to use the channels to run 50 mint transactions in parallel', async () => {
        const promises = []
        userExpectedBalance += 10 * 50

        for (let i = 0; i < 50; i++) {
          promises.push(
            expect(
              sacAsset.classicHandler.mint({
                to: user.getPublicKey(),
                amount: 10,
                ...simpleTxInvocation(issuer),
              })
            ).toResolve()
          )
        }
        await Promise.all(promises)

        await expect(sacAsset.classicHandler.balance(user.getPublicKey())).resolves.toBe(userExpectedBalance)
      })

      it('should be able to wrap the asset in an SAC contract', async () => {
        await expect(sacAsset.wrapAndDeploy(simpleTxInvocation(issuer))).toResolve()
        expect(sacAsset.sorobanTokenHandler.getContractId()).toMatch(contractIdRegex)
      })

      describe('Given the asset has been wrapped and deployed with the SAC', () => {
        it('should be able to use the channels to run 50 transfer soroban transactions in parallel', async () => {
          const promises = []

          for (let i = 0; i < 50; i++) {
            promises.push(
              expect(
                sacAsset.sorobanTokenHandler.transfer({
                  from: user.getPublicKey(),
                  to: user.getPublicKey(), // sending to itself so the simultaneous simulations don't clash with wrong balances
                  amount: BigInt(1),
                  ...simpleTxInvocation(user),
                })
              ).toResolve()
            )
          }
          await Promise.all(promises)

          await expect(
            sacAsset.sorobanTokenHandler.balance({ id: user.getPublicKey(), ...simpleTxInvocation(user) })
          ).resolves.toBe(BigInt(userExpectedBalance * 10 ** 7))
        })
      })
    })

    describe('After all transactions', () => {
      it('Can use the channel accounts helper tool to close 10 channels', async () => {
        await expect(
          ChannelAccounts.closeChannels({
            networkConfig,
            txInvocation: simpleTxInvocation(issuer),
            sponsor: issuer,
            channels,
          })
        ).toResolve()
      })
    })
  })
})
