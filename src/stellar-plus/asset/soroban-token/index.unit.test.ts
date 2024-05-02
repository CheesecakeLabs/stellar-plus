/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Address, ContractSpec } from '@stellar/stellar-sdk'

import { SorobanTokenHandler } from 'stellar-plus/asset/soroban-token'
import { spec as DEFAULT_SPEC, methods } from 'stellar-plus/asset/soroban-token/constants'
import { SorobanTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-transaction'
import { TestNet } from 'stellar-plus/network'
import { TransactionInvocation } from 'stellar-plus/types'

jest.mock('stellar-plus/core/pipelines/soroban-transaction', () => ({
  SorobanTransactionPipeline: jest.fn(),
}))

const MOCKED_SOROBAN_TRANSACTION_PIPELINE = SorobanTransactionPipeline as jest.Mock
const MOCKED_EXECUTE = jest.fn().mockResolvedValue({})

const NETWORK_CONFIG = TestNet()

const MOCKED_CONTRACT_ID = 'CBJT4BOMRHYKHZ6HF3QG4YR7Q63BE44G73M4MALDTQ3SQVUZDE7GN35I'
const MOCKED_WASM_HASH = 'eb94566536d7f56c353b4760f6e359eca3631b70d295820fb6de55a796e019ae'
const MOCKED_WASM_FILE = Buffer.from('mockWasm', 'utf-8')

const MOCKED_TX_INVOCATION: TransactionInvocation = {
  header: {
    source: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
    fee: '100',
    timeout: 45,
  },
  signers: [],
}

describe('SorobanToken', () => {
  describe('Initialization', () => {
    it('should initialize with the contract id', () => {
      const token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
        },
      })

      expect(token.getContractId()).toBe(MOCKED_CONTRACT_ID)
    })

    it('should initialize with a custom spec', () => {
      const mockedSpec = new ContractSpec(['AAAAAAAAAAAAAAAEbmFtZQAAAAAAAAABAAAAEA=='])
      const token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
          spec: mockedSpec,
        },
      })
      const spyTokenSpec = jest.mocked((token as any).spec)

      expect(spyTokenSpec).toBe(mockedSpec)
    })

    it('should initialize with default spec if nothing no contract parameters are provided', () => {
      const token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
      })
      const spyTokenSpec = jest.mocked((token as any).spec)

      expect(spyTokenSpec).toBe(DEFAULT_SPEC)
    })

    it('should initialize with a custom wasm hash', () => {
      const token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasmHash: MOCKED_WASM_HASH,
        },
      })

      expect(token.getWasmHash()).toBe(MOCKED_WASM_HASH)
    })

    it('should initialize with a custom wasm', () => {
      const token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          wasm: MOCKED_WASM_FILE,
        },
      })

      expect(token.getWasm()).toBe(MOCKED_WASM_FILE)
    })
  })

  describe('Core invoke methods', () => {
    let token: SorobanTokenHandler
    let invokeSpy: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()

      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: MOCKED_EXECUTE,
        }
      })

      token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
        },
      })

      invokeSpy = jest.spyOn(token as any, 'invokeContract')
    })

    afterEach(() => {
      expect(MOCKED_EXECUTE).toHaveBeenCalledOnce()
    })

    it('should initialize the contract invoking the initialize method', async () => {
      const initializeArgs = {
        admin: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
        decimal: 7,
        name: 'mockedName',
        symbol: 'mockedSymbol',
      }

      await token.initialize({ ...initializeArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.initialize,
        methodArgs: { ...initializeArgs, admin: new Address(initializeArgs.admin) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should set a new admin', async () => {
      const currentAdmin = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const newAdmin = 'GBC7ALQTV35BQ3URS5NUHHSWWN3KEXMRGFJ2S4S6VETJ6QA7QCDA64VI'
      const setAdminArgs = {
        id: currentAdmin,
        new_admin: newAdmin,
      }

      await token.setAdmin({ ...setAdminArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.set_admin,
        methodArgs: { id: new Address(currentAdmin), new_admin: new Address(newAdmin) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    // TODO: Review the default SPEC file under constants
    // It seems it is not fully compliant with CAP46
    it.skip('should set an account as authorized', async () => {
      const accountToAuthorize = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const setAuthorizedArgs = {
        id: accountToAuthorize,
        authorize: true,
      }

      await token.setAuthorized({ ...setAuthorizedArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.set_authorized,
        methodArgs: { ...setAuthorizedArgs, id: new Address(accountToAuthorize) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should mint new units', async () => {
      const recipient = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const mintArgs = {
        to: recipient,
        amount: BigInt(125),
      }

      await token.mint({ ...mintArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.mint,
        methodArgs: { ...mintArgs, to: new Address(recipient) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should burn existing units', async () => {
      const from = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const burnArgs = {
        from,
        amount: BigInt(131),
      }

      await token.burn({ ...burnArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.burn,
        methodArgs: { ...burnArgs, from: new Address(from) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    // TODO: Review the default SPEC file under constants
    // It seems it is not fully compliant with CAP46
    it.skip('should clawback funds from an account', async () => {
      const targetAccount = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const clawbackArgs = {
        from: targetAccount,
        amount: BigInt(510),
      }

      await token.clawback({ ...clawbackArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.clawback,
        methodArgs: { ...clawbackArgs, from: new Address(targetAccount) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should apprve an account as spender', async () => {
      const from = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const spender = 'GBC7ALQTV35BQ3URS5NUHHSWWN3KEXMRGFJ2S4S6VETJ6QA7QCDA64VI'
      const approveArgs = {
        from,
        spender,
        amount: BigInt(510),
        expiration_ledger: 10,
      }

      await token.approve({ ...approveArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.approve,
        methodArgs: { ...approveArgs, from: new Address(from), spender: new Address(spender) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should transfer from an account to another', async () => {
      const from = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const to = 'GBC7ALQTV35BQ3URS5NUHHSWWN3KEXMRGFJ2S4S6VETJ6QA7QCDA64VI'
      const transferArgs = {
        from,
        to,
        amount: BigInt(11),
      }

      await token.transfer({ ...transferArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.transfer,
        methodArgs: { ...transferArgs, from: new Address(from), to: new Address(to) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should allow a spender to transfer from an account to another', async () => {
      const from = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
      const to = 'GBC7ALQTV35BQ3URS5NUHHSWWN3KEXMRGFJ2S4S6VETJ6QA7QCDA64VI'
      const spender = 'GBDDXMKAGNMZIG6LAVARGB6PHWK2WXBDJDDLD7F4CCTRWZ62BXV7SM2W'
      const transferArgs = {
        from,
        to,
        spender,
        amount: BigInt(11),
      }

      await token.transferFrom({ ...transferArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.transfer_from,
        methodArgs: { ...transferArgs, from: new Address(from), to: new Address(to), spender: new Address(spender) },
        ...MOCKED_TX_INVOCATION,
      })
    })

    it('should allow a spender to burn from an account', async () => {
      const from = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'

      const spender = 'GBDDXMKAGNMZIG6LAVARGB6PHWK2WXBDJDDLD7F4CCTRWZ62BXV7SM2W'
      const burnFromArgs = {
        from,

        spender,
        amount: BigInt(11),
      }

      await token.burnFrom({ ...burnFromArgs, ...MOCKED_TX_INVOCATION })

      expect(invokeSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.burn_from,
        methodArgs: { ...burnFromArgs, from: new Address(from), spender: new Address(spender) },
        ...MOCKED_TX_INVOCATION,
      })
    })
  })

  describe('Core read from contract methods', () => {
    let token: SorobanTokenHandler
    let readSpy: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()

      MOCKED_SOROBAN_TRANSACTION_PIPELINE.mockImplementation(() => {
        return {
          execute: MOCKED_EXECUTE,
        }
      })

      token = new SorobanTokenHandler({
        networkConfig: NETWORK_CONFIG,
        contractParameters: {
          contractId: MOCKED_CONTRACT_ID,
        },
      })

      readSpy = jest.spyOn(token as any, 'readFromContract')
    })

    afterEach(() => {
      expect(MOCKED_EXECUTE).toHaveBeenCalledOnce()
    })

    it('should read the symbol of the token', async () => {
      await token.symbol(MOCKED_TX_INVOCATION)

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.symbol,
        methodArgs: {},
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    it('should read the name of the token', async () => {
      await token.name(MOCKED_TX_INVOCATION)

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.name,
        methodArgs: {},
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    it('should read the decimals of the token', async () => {
      await token.decimals(MOCKED_TX_INVOCATION)

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.decimals,
        methodArgs: {},
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    // TODO: Review the default SPEC file under constants
    // It seems it is not fully compliant with CAP46
    it.skip('should read the admin of the token', async () => {
      await token.admin(MOCKED_TX_INVOCATION)

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.admin,
        methodArgs: {},
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    it('should read the balance of an account', async () => {
      const balanceArgs = {
        id: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
      }

      await token.balance({ ...balanceArgs, ...MOCKED_TX_INVOCATION })

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.balance,
        methodArgs: { id: new Address(balanceArgs.id) },
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    // TODO: Review the default SPEC file under constants
    // It seems it is not fully compliant with CAP46
    it.skip('should read the spendable balance of an account', async () => {
      const spendableBalanceArgs = {
        id: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
      }

      await token.spendableBalance({ ...spendableBalanceArgs, ...MOCKED_TX_INVOCATION })

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.spendable_balance,
        methodArgs: { id: new Address(spendableBalanceArgs.id) },
        header: MOCKED_TX_INVOCATION.header,
      })
    })

    it('should read the allowance for a spender an account', async () => {
      const allowanceArgs = {
        from: 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI',
        spender: 'GBDDXMKAGNMZIG6LAVARGB6PHWK2WXBDJDDLD7F4CCTRWZ62BXV7SM2W',
      }

      await token.allowance({ ...allowanceArgs, ...MOCKED_TX_INVOCATION })

      expect(readSpy).toHaveBeenCalledExactlyOnceWith({
        method: methods.allowance,
        methodArgs: { from: new Address(allowanceArgs.from), spender: new Address(allowanceArgs.spender) },
        header: MOCKED_TX_INVOCATION.header,
      })
    })
  })
})
