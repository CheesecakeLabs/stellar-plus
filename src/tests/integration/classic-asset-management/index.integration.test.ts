import { DefaultAccountHandler } from 'stellar-plus/account'
import { ClassicAssetHandler } from 'stellar-plus/asset'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { simpleTxInvocation } from 'tests/utils'

describe('Classic Asset Management Use Case: ', () => {
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

  describe('Given an issuer with lumens', () => {
    let issuer: DefaultAccountHandler
    let userA: DefaultAccountHandler
    let userB: DefaultAccountHandler
    let userC: DefaultAccountHandler

    let userAExpectedBalance: number
    let userBExpectedBalance: number
    let userCExpectedBalance: number

    beforeAll(async () => {
      issuer = new DefaultAccountHandler({ networkConfig })
      await issuer.initializeWithFriendbot()
      expect(issuer).toBeDefined()

      userA = new DefaultAccountHandler({ networkConfig })
      userB = new DefaultAccountHandler({ networkConfig })
      userC = new DefaultAccountHandler({ networkConfig })

      await userA.initializeWithFriendbot()
      await userB.initializeWithFriendbot()
      await userC.initializeWithFriendbot()

      userAExpectedBalance = 0
      userBExpectedBalance = 0
      userCExpectedBalance = 0
    })

    describe('A Classic Asset Handler initialized with the issuer account handler', () => {
      let classicAssetMgnt: ClassicAssetHandler

      beforeAll(async () => {
        classicAssetMgnt = new ClassicAssetHandler({
          code: 'SPLUS',
          issuerAccount: issuer,
          networkConfig,
        })
        expect(classicAssetMgnt).toBeDefined()
      })

      it('should fetch a "0" balance for an account with no trustline', async () => {
        userAExpectedBalance = 0

        await expect(classicAssetMgnt.balance(userA.getPublicKey())).resolves.toBe(userAExpectedBalance)
      })

      it('should add a trustline and mint to a target account', async () => {
        userAExpectedBalance += 1000

        await expect(
          classicAssetMgnt.addTrustlineAndMint({
            to: userA.getPublicKey(),
            amount: 1000,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
        await expect(classicAssetMgnt.balance(userA.getPublicKey())).resolves.toBe(userAExpectedBalance)
      })

      it

      it('should add a trustline to a target account', async () => {
        userBExpectedBalance = 0

        await expect(
          classicAssetMgnt.addTrustline({
            to: userB.getPublicKey(),
            ...simpleTxInvocation(userB),
          })
        ).toResolve()
        await expect(classicAssetMgnt.balance(userB.getPublicKey())).resolves.toBe(userBExpectedBalance)
      })

      it('should mint to a target account with a trustline', async () => {
        userBExpectedBalance += 600

        await expect(
          classicAssetMgnt.mint({
            to: userB.getPublicKey(),
            amount: 600,
            ...simpleTxInvocation(issuer),
          })
        ).toResolve()
        await expect(classicAssetMgnt.balance(userB.getPublicKey())).resolves.toBe(userBExpectedBalance)
      })

      it('should burn from a target account with a trustline', async () => {
        userBExpectedBalance -= 100

        await expect(
          classicAssetMgnt.burn({
            from: userB.getPublicKey(),
            amount: 100,
            ...simpleTxInvocation(userB),
          })
        ).toResolve()
        await expect(classicAssetMgnt.balance(userB.getPublicKey())).resolves.toBe(userBExpectedBalance)
      })

      it('should transfer from one account to another', async () => {
        userAExpectedBalance -= 250
        userBExpectedBalance += 250

        await expect(
          classicAssetMgnt.transfer({
            from: userA.getPublicKey(),
            to: userB.getPublicKey(),
            amount: 250,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
        await expect(classicAssetMgnt.balance(userA.getPublicKey())).resolves.toBe(userAExpectedBalance)
        await expect(classicAssetMgnt.balance(userB.getPublicKey())).resolves.toBe(userBExpectedBalance)
      })
    })

    describe('A Classic Asset Handler initialized with the issuer public key', () => {
      let classicAsset: ClassicAssetHandler

      beforeAll(async () => {
        classicAsset = new ClassicAssetHandler({
          code: 'SPLUS',
          issuerAccount: issuer.getPublicKey(),
          networkConfig,
        })
        expect(classicAsset).toBeDefined()
      })

      it('should add a trustline to a target account', async () => {
        userCExpectedBalance = 0

        await expect(
          classicAsset.addTrustline({
            to: userC.getPublicKey(),
            ...simpleTxInvocation(userC),
          })
        ).toResolve()
        await expect(classicAsset.balance(userC.getPublicKey())).resolves.toBe(userCExpectedBalance)
      })

      it('should transfer from one account to another', async () => {
        userAExpectedBalance -= 250
        userCExpectedBalance += 250

        await expect(
          classicAsset.transfer({
            from: userA.getPublicKey(),
            to: userC.getPublicKey(),
            amount: 250,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
        await expect(classicAsset.balance(userA.getPublicKey())).resolves.toBe(userAExpectedBalance)
        await expect(classicAsset.balance(userC.getPublicKey())).resolves.toBe(userCExpectedBalance)
      })

      it('should not mint', async () => {
        await expect(
          classicAsset.mint({
            to: userB.getPublicKey(),
            amount: 600,
            ...simpleTxInvocation(userB),
          })
        ).rejects.toThrow()
      })
    })
  })
})
