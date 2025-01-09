import { StellarPlus } from 'index'
import { DefaultAccountHandler } from 'stellar-plus/account'
import { SACHandler } from 'stellar-plus/asset'
import { ChannelAccounts } from 'stellar-plus/channel-accounts'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { TransactionInvocation } from 'stellar-plus/types'
import { SorobanChannelAccountsPlugin } from 'stellar-plus/utils/pipeline/plugins/soroban-transaction'
import { FeeBumpWrapperPlugin } from 'stellar-plus/utils/pipeline/plugins/submit-transaction'
import { contractIdRegex, wasmHashRegex } from 'stellar-plus/utils/regex'
import { InitializeArgs, methods } from 'tests/contracts/hello-world/spec'
import { loadWasmFile, simpleTxInvocation, simpleTxInvocationToFeebump } from 'tests/utils'

describe('Hello World Contract Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
  })

  let networkConfig: NetworkConfig
  let wasmBuffer: Buffer

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const container = await stellarTestLedger.start()
    expect(container).toBeDefined()

    networkConfig = CustomNet(await stellarTestLedger.getNetworkConfiguration())
    expect(networkConfig.horizonUrl).toBeDefined()
    expect(networkConfig.networkPassphrase).toBeDefined()
    expect(networkConfig.rpcUrl).toBeDefined()
    expect(networkConfig.friendbotUrl).toBeDefined()

    wasmBuffer = await loadWasmFile('./src/tests/contracts/hello-world/hello_world.wasm')
    expect(wasmBuffer).toBeDefined()
  })

  afterAll(async () => {
    await stellarTestLedger.stop()
    await stellarTestLedger.destroy()
  })

  describe('Given an admin with lumens', () => {
    let admin: DefaultAccountHandler
    let adminTxInvocation: TransactionInvocation
    let sorobanCAPlugin: SorobanChannelAccountsPlugin
    let channels: DefaultAccountHandler[]
    let sacAsset: SACHandler
    let feeBumpPlugin: FeeBumpWrapperPlugin

    beforeAll(async () => {
      admin = new DefaultAccountHandler({ networkConfig })
      await admin.initializeWithFriendbot()

      expect(admin).toBeDefined()

      channels = await ChannelAccounts.openChannels({
        networkConfig,
        numberOfChannels: 10,
        txInvocation: simpleTxInvocation(admin),
        sponsor: admin,
      })

      sorobanCAPlugin = new StellarPlus.Utils.Plugins.sorobanTransaction.SorobanChannelAccountsPlugin({ channels })
      expect(sorobanCAPlugin).toBeDefined()

      const feebumpHeader = simpleTxInvocationToFeebump(simpleTxInvocation(admin))
      feeBumpPlugin = new StellarPlus.Utils.Plugins.submitTransaction.FeeBumpWrapperPlugin(feebumpHeader)

      expect(feeBumpPlugin).toBeDefined()

      sacAsset = new SACHandler({
        code: 'SPLUSSAC',
        issuerAccount: admin,
        networkConfig,
        options: {
          sorobanTransactionPipeline: {
            plugins: [sorobanCAPlugin, feeBumpPlugin],
          },
        },
      })

      expect(sacAsset).toBeDefined()

      adminTxInvocation = {
        header: {
          source: admin.getPublicKey(),
          fee: '100000',
          timeout: 0,
        },
        signers: [admin],
      }
    })

    describe('A Contract Engine', () => {
      let helloWorld: ContractEngine

      beforeAll(() => {
        helloWorld = new ContractEngine({
          contractParameters: {
            wasm: wasmBuffer,
          },
          networkConfig,
        })

        expect(helloWorld).toBeDefined()
      })

      it('should upload the wasm buffer and update the wasm hash', async () => {
        await expect(helloWorld.uploadWasm(adminTxInvocation)).toResolve()
        expect(helloWorld.getWasmHash()).toBeDefined()
        expect(helloWorld.getWasmHash()).toMatch(wasmHashRegex)
      })

      it('should deploy the contract using the wasm hash and update the contract id', async () => {
        await expect(helloWorld.deploy(adminTxInvocation)).toResolve()
        expect(helloWorld.getContractId()).toBeDefined()
        expect(helloWorld.getContractId()).toMatch(contractIdRegex)
      })

      it('should initialize the asset', async () => {
        await expect(sacAsset.wrapAndDeploy(simpleTxInvocation(admin))).toResolve()
        expect(sacAsset.sorobanTokenHandler.getContractId()).toMatch(contractIdRegex)
      })

      it('should invoke the contract initialize and update the contract state', async () => {
        await expect(
          helloWorld.invokeContract({
            method: methods.initialize,
            methodArgs: {
              admin: admin.getPublicKey(),
              token: sacAsset.sorobanTokenHandler.getContractId(),
            } as InitializeArgs,
            ...adminTxInvocation,
          })
        ).toResolve()
      })
    })
  })
})
