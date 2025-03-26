import { DefaultAccountHandler } from 'stellar-plus/account'
import { SACHandler } from 'stellar-plus/asset'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, SupportedImageVersions, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { contractIdRegex } from 'stellar-plus/utils/regex'
import { simpleTxInvocation } from 'tests/utils'

describe('Classic Asset Wrapping Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
    containerImageVersion: SupportedImageVersions.LASTEST,
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

  describe('Given an issuer with lumens', () => {
    let issuer: DefaultAccountHandler

    beforeAll(async () => {
      issuer = new DefaultAccountHandler({ networkConfig })
      await issuer.initializeWithFriendbot()
      expect(issuer).toBeDefined()
    })

    describe('A Classic Asset Handler initialized with the issuer account handler', () => {
      let sac: SACHandler

      beforeAll(async () => {
        sac = new SACHandler({
          code: 'SPLUS',
          issuerAccount: issuer,
          networkConfig,
        })
        expect(sac).toBeDefined()
      })

      it('should be wrapped in an SAC', async () => {
        await expect(sac.wrapAndDeploy(simpleTxInvocation(issuer))).toResolve()
        expect(sac.sorobanTokenHandler.getContractId()).toMatch(contractIdRegex)
      })

      it('should handle when asset is already wrapped in an SAC', async () => {
        const sacInstance = new SACHandler({
          code: 'SPLUS2',
          issuerAccount: issuer,
          networkConfig,
        })
        const newSacInstance = new SACHandler({
          code: 'SPLUS2',
          issuerAccount: issuer,
          networkConfig,
        })
        await sacInstance.wrapAndDeploy(simpleTxInvocation(issuer))

        await expect(newSacInstance.wrapAndDeploy(simpleTxInvocation(issuer))).toResolve()

        expect(newSacInstance.sorobanTokenHandler.getContractId()).toMatch(contractIdRegex)
        expect(sacInstance.sorobanTokenHandler.getContractId()).toBe(newSacInstance.sorobanTokenHandler.getContractId())
      })
    })
  })
})
