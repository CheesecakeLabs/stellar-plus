import { Account } from 'stellar-plus'
import { ClassicAssetHandler } from 'stellar-plus/asset'
import { LocalStellarLedger } from 'tools/test-ledger/local'

describe('Demo Integration Test', () => {
  const ledger = new LocalStellarLedger()
  expect(ledger).toBeTruthy()

  beforeAll(async () => {
    await ledger.start()
  })

  afterAll(async () => {
    await ledger.stop() //.then(() => ledger.destroy())
  })

  it('should pass', async () => {
    const localNetworkConfig = ledger.getNetworkConfig()

    const opexAccount = new Account.DefaultAccountHandler({ networkConfig: localNetworkConfig })

    await opexAccount.initializeWithFriendbot()

    const XLM = new ClassicAssetHandler({
      code: 'XLM',
      networkConfig: localNetworkConfig,
    })

    expect(opexAccount.getBalances()).toBeTruthy()
    expect(await XLM.balance(opexAccount.getPublicKey())).toBe(10000)

    const account2 = new Account.DefaultAccountHandler({ networkConfig: localNetworkConfig })

    await account2.initializeWithFriendbot()

    const txInvocation = {
      header: {
        source: opexAccount.getPublicKey(),
        fee: '100',
        timeout: 30,
      },
      signers: [opexAccount],
    }
    await XLM.transfer({
      from: opexAccount.getPublicKey(),
      to: account2.getPublicKey(),
      amount: 1000,
      ...txInvocation,
    })

    expect(await XLM.balance(opexAccount.getPublicKey())).toBe(9000 - 0.00001)
    expect(await XLM.balance(account2.getPublicKey())).toBe(11000)
  })
})
