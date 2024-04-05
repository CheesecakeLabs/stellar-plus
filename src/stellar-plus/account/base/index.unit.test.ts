import { AccountBaseClient } from 'stellar-plus/account/base'
import { testnet } from 'stellar-plus/constants'

const TESTNET_CONFIG = testnet

const MOCKED_PK = 'GAUFIAL2LV2OV7EA4NTXZDVPQASGI5Y3EXZV2HQS3UUWMZ7UWJDQURYS'

describe('Base Account Handler', () => {
  it('should initialize the base account handler with a public key', () => {
    const account = new AccountBaseClient({ publicKey: MOCKED_PK })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const spyPublicKey = jest.mocked((account as any).publicKey)

    expect(account).toBeDefined()
    expect(account).toBeInstanceOf(AccountBaseClient)
    expect(spyPublicKey).toBe(MOCKED_PK)
  })

  it('should initialize the base account handler with a network config, enabling helpers', () => {
    const account = new AccountBaseClient({ publicKey: MOCKED_PK, networkConfig: TESTNET_CONFIG })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const spyAccountDataViewer = jest.mocked((account as any).accountDataViewer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const spyFriendbot = jest.mocked((account as any).friendbot)

    expect(account).toBeDefined()
    expect(account).toBeInstanceOf(AccountBaseClient)
    expect(spyAccountDataViewer).toBeDefined()
    expect(spyFriendbot).toBeDefined()
  })

  it('should return the public key of the account', () => {
    const account = new AccountBaseClient({ publicKey: MOCKED_PK })

    expect(account.getPublicKey()).toBe(MOCKED_PK)
  })
})
