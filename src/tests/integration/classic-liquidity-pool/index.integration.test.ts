import { DefaultAccountHandler } from 'stellar-plus/account'
import { ClassicAssetHandler } from 'stellar-plus/asset'
import { ClassicLiquidityPoolHandler } from 'stellar-plus/markets'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'
import { simpleTxInvocation } from 'tests/utils'

describe('Classic Liquidity Pool Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
  })

  let networkConfig: NetworkConfig
  beforeAll(async () => {
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

  describe('Liquidity Pool Operations with Issuer and Users', () => {
    let issuer: DefaultAccountHandler
    let userA: DefaultAccountHandler

    beforeAll(async () => {
      issuer = new DefaultAccountHandler({ networkConfig })
      await issuer.initializeWithFriendbot()
      expect(issuer).toBeDefined()

      userA = new DefaultAccountHandler({ networkConfig })
      await userA.initializeWithFriendbot()
    })

    describe('Managing a Classic Liquidity Pool', () => {
      let assetA: ClassicAssetHandler
      let assetB: ClassicAssetHandler
      let classicLiquidityPool: ClassicLiquidityPoolHandler

      beforeAll(async () => {
        assetA = new ClassicAssetHandler({
          code: 'ASSET1',
          issuerAccount: issuer,
          networkConfig,
        })
        assetB = new ClassicAssetHandler({
          code: 'ASSET2',
          issuerAccount: issuer,
          networkConfig,
        })
        classicLiquidityPool = new ClassicLiquidityPoolHandler({
          assetA: assetA,
          assetB: assetB,
          networkConfig: networkConfig,
        })
        expect(assetA).toBeDefined()
        expect(assetB).toBeDefined()

        await expect(
          assetA.addTrustlineAndMint({
            to: userA.getPublicKey(),
            amount: 1000,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()

        await expect(
          assetB.addTrustlineAndMint({
            to: userA.getPublicKey(),
            amount: 1000,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()

        expect(classicLiquidityPool).toBeDefined()
      })

      it('should successfully add a trustline to the liquidity pool', async () => {
        await expect(
          classicLiquidityPool.addTrustline({
            to: userA.getPublicKey(),
            fee: 30,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should successfully deposit equal amounts of both assets (10 units each)', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '10',
            amountB: '10',
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should successfully deposit different amounts (100 units of asset A and 50 units of asset B)', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '100',
            amountB: '50',
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should throw an error when trying to deposit more than the available balance', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '100000',
            amountB: '100000',
            ...simpleTxInvocation(userA),
          })
        ).rejects.toThrow()
      })

      it('should successfully deposit with minimum and maximum prices defined as strings', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '10',
            amountB: '10',
            minPrice: '1',
            maxPrice: '1',
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should successfully deposit with minimum and maximum prices defined as numbers', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '12',
            amountB: '16',
            minPrice: 1,
            maxPrice: 1,
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should successfully deposit with valid price objects for minimum and maximum', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '15',
            amountB: '14',
            minPrice: { n: 1, d: 1 },
            maxPrice: { n: 1, d: 1 },
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should throw an error when using invalid price objects for minimum and maximum', async () => {
        await expect(
          classicLiquidityPool.deposit({
            amountA: '11',
            amountB: '25',
            minPrice: { n: 1, e: 1 },
            maxPrice: { n: 1, e: 1 },
            ...simpleTxInvocation(userA),
          })
        ).rejects.toThrow()
      })

      it('should successfully withdraw a valid amount from the liquidity pool', async () => {
        await expect(
          classicLiquidityPool.withdraw({
            amount: '10',
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })

      it('should throw an error when trying to withdraw an amount exceeding the available balance', async () => {
        await expect(
          classicLiquidityPool.withdraw({
            amount: '10000',
            ...simpleTxInvocation(userA),
          })
        ).rejects.toThrow()
      })

      it('should successfully withdraw with specified minimum amounts for both assets', async () => {
        await expect(
          classicLiquidityPool.withdraw({
            amount: '10',
            minAmountA: '10',
            minAmountB: '10',
            ...simpleTxInvocation(userA),
          })
        ).toResolve()
      })
    })
  })
})
