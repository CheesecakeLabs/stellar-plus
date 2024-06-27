import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk'

import { DefaultAccountHandler } from 'stellar-plus/account'
import { AccountBase } from 'stellar-plus/account/base'
import { CustomNet, NetworkConfig } from 'stellar-plus/network'
import { StellarTestLedger, TestLedgerNetwork } from 'stellar-plus/test/stellar-test-ledger'

const unsignedTransactionXdr =
  'AAAAAgAAAABgo53xrTeR7T9m6iwXaLPmnEoWIiVB8KW/GNmxB10yugAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

describe('Managing Account Use Case: ', () => {
  const logLevel = 'TRACE'
  const stellarTestLedger = new StellarTestLedger({
    logLevel,
    network: TestLedgerNetwork.LOCAL,
    useRunningLedger: true,
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
    // TODO: Uncomment stop and destroy
    // await stellarTestLedger.stop()
    // await stellarTestLedger.destroy()
  })

  describe('A DefaultAccountHandler', () => {
    let accountDef: DefaultAccountHandler

    beforeAll(() => {
      accountDef = new DefaultAccountHandler({ networkConfig })
    })

    describe('Given a fresh account', () => {
      it('should initialize the account with Friendbot', async () => {
        await expect(accountDef.initializeWithFriendbot()).toResolve()
      })
    })

    describe('Given an initialized account', () => {
      it('should fail when attempting to initialize the account with Friendbot again', async () => {
        await expect(accountDef.initializeWithFriendbot()).rejects.toThrow()
      })

      it('should be able to fetch balances for the initialize account', async () => {
        const balances = await accountDef.getBalances()
        const xlmBalance = balances.find((bal) => bal.asset_type === 'native')?.balance

        expect(balances).toBeDefined()
        expect(balances.length).toBeGreaterThan(0)
        expect(xlmBalance).toBe('10000.0000000')
      })

      it('should be able to sign a transaction with the accoutns private key', async () => {
        const transaction = TransactionBuilder.fromXDR(unsignedTransactionXdr, networkConfig.networkPassphrase)
        const signedTransaction = await accountDef.sign(transaction)
        const signedEnvelope = TransactionBuilder.fromXDR(signedTransaction, networkConfig.networkPassphrase)

        expect(signedTransaction).toBeDefined()
        expect(signedEnvelope).toBeDefined()
        expect(signedEnvelope.signatures.length).toBeGreaterThan(0)
      })
    })
  })

  describe('An AccountBase', () => {
    let accountBase: AccountBase

    beforeAll(() => {
      const randomPublicKey = Keypair.random().publicKey()

      accountBase = new AccountBase({
        networkConfig,
        publicKey: randomPublicKey,
      })
    })

    describe('Given a fresh account', () => {
      it('should initialize the account with Friendbot', async () => {
        await expect(accountBase.initializeWithFriendbot()).toResolve()
      })
    })

    describe('Given an initialized account', () => {
      it('should fail when attempting to initialize the account with Friendbot again', async () => {
        await expect(accountBase.initializeWithFriendbot()).rejects.toThrow()
      })

      it('should be able to fetch balances for the initialize account', async () => {
        const balances = await accountBase.getBalances()
        const xlmBalance = balances.find((bal) => bal.asset_type === 'native')?.balance

        expect(balances).toBeDefined()
        expect(balances.length).toBeGreaterThan(0)
        expect(xlmBalance).toBe('10000.0000000')
      })
    })
  })
})
