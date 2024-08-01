import { Spec } from '@stellar/stellar-sdk/contract'

import { DefaultAccountHandler } from 'stellar-plus/account'
import { ContractEngine } from 'stellar-plus/core/contract-engine'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { TransactionInvocation } from 'stellar-plus/types'
import { contractIdRegex, wasmHashRegex } from 'stellar-plus/utils/regex'
import { GetNameArgs, GetNameResponse, methods, spec } from 'tests/contracts/hello-world/spec'
import { loadWasmFile } from 'tests/utils'

describe('Hello World Contract Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
  })

  let helloWorldSpec: Spec
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

    helloWorldSpec = new Spec(spec)
  })

  afterAll(async () => {
    await stellarTestLedger.stop()
    await stellarTestLedger.destroy()
  })

  describe('Given an admin with lumens', () => {
    let admin: DefaultAccountHandler
    let adminTxInvocation: TransactionInvocation

    beforeAll(async () => {
      admin = new DefaultAccountHandler({ networkConfig })
      await admin.initializeWithFriendbot()

      expect(admin).toBeDefined()

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
            spec: helloWorldSpec,
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

      it('should invoke the contract method GetName that returns an output', async () => {
        await expect(
          helloWorld.invokeContract({
            method: methods.getName,
            methodArgs: {} as GetNameArgs,
            ...adminTxInvocation,
          })
        ).resolves.toBe('CaptainCacti' as GetNameResponse)
      })

      it('should read from the contract state by just simulating the GetName execution and return and output', async () => {
        await expect(
          helloWorld.readFromContract({
            method: methods.getName,
            methodArgs: {} as GetNameArgs,
            ...adminTxInvocation,
          })
        ).resolves.toBe('CaptainCacti' as GetNameResponse)
      })
    })
  })
})
