import { Account, SorobanDataBuilder, SorobanRpc, Transaction, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

import { Constants } from 'stellar-plus'
import { SimulateTransactionPipeline } from 'stellar-plus/core/pipelines/simulate-transaction'
import { SorobanAuthPipeline } from 'stellar-plus/core/pipelines/soroban-auth'
import { PSAError } from 'stellar-plus/core/pipelines/soroban-auth/errors'
import { SorobanAuthPipelineInput, SorobanAuthPipelineType } from 'stellar-plus/core/pipelines/soroban-auth/types'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler'
import { mockAccountHandler } from 'stellar-plus/test/mocks/transaction-mock'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

const TESTNET_NETWORK_CONFIG = Constants.testnet
const MOCKED_TRANSACTION_OUTPUT = new Transaction(
  'AAAAAgAAAAA/s0szuJKLyO2bQJ0DxXjYA2p8sf8kTBjkhAVTV64DQgAAAGQAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  TESTNET_NETWORK_CONFIG.networkPassphrase
)

jest.mock('stellar-plus/core/pipelines/simulate-transaction', () => {
  return {
    SimulateTransactionPipeline: jest.fn().mockImplementation(() => {
      return {
        execute: jest.fn().mockImplementation(() => {
          return Promise.resolve({ assembledTransaction: MOCKED_TRANSACTION_OUTPUT })
        }),
      }
    }),
  }
})

jest.mock('stellar-plus/rpc/default-handler', () => {
  return {
    DefaultRpcHandler: jest.fn().mockImplementation(() => {
      return {
        getLatestLedger: jest.fn().mockImplementation(() => {
          return {
            sequence: 0,
          }
        }),
      }
    }),
  }
})

const MOCKED_SIMULATE_TRANSACTION_PIPELINE = SimulateTransactionPipeline as jest.Mock
const MOCKED_DEFAULT_RPC_HANDLER = DefaultRpcHandler as jest.Mock

const MOCKED_PK_A = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_ACCOUNT_A = new Account(MOCKED_PK_A, '100')

const MOCKED_TX_OPTIONS: TransactionBuilder.TransactionBuilderOptions = {
  fee: '100',
  networkPassphrase: TESTNET_NETWORK_CONFIG.networkPassphrase,
  timebounds: {
    minTime: 0,
    maxTime: 10,
  },
}

const MOCKED_AUTH_ENTRY_A_XDR =
  'AAAAAQAAAAAAAAAArb8JC0i36Dmfgz6KW5WQ0tnZdAEJokT6E14XqgChUA1ikGR38zUPUgAAAAAAAAABAAAAAAAAAAFk7Ujzh9RWi2IGWZcvksnk6CDy39UadWJfYdD9K0mf2AAAAAh0cmFuc2ZlcgAAAAMAAAASAAAAAAAAAACtvwkLSLfoOZ+DPopblZDS2dl0AQmiRPoTXheqAKFQDQAAABIAAAAAAAAAAPVDIFPI3hOwtWMsV6KpQaDW/2Yg+ouWRCzidXCyoZP5AAAACgAAAAAAAAAAAAAAAAAAAAEAAAAA'
const MOCKED_AUTH_ENTRY_A = xdr.SorobanAuthorizationEntry.fromXDR(MOCKED_AUTH_ENTRY_A_XDR, 'base64')

const MOCKED_AUTH_ENTRY_A_REQ_SIGNER = 'GCW36CILJC36QOM7QM7IUW4VSDJNTWLUAEE2ERH2CNPBPKQAUFIA2GRV'

const MOCKED_AUTH_ENTRY_B_XDR =
  'AAAAAQAAAAAAAAAAovR6uAp1T7jRCxGrvh8SBIppUR9ZD2/eCQT9tGO26OdII5B9b2HQOAAAAAAAAAABAAAAAAAAAAHTgPPxxvd0QWWI9GqET9mM/ybmAbehCVOSDLq8gmyohQAAAAh0cmFuc2ZlcgAAAAMAAAASAAAAAAAAAACi9Hq4CnVPuNELEau+HxIEimlRH1kPb94JBP20Y7bo5wAAABIAAAAAAAAAAIgOB9aLzALzAdu7EDOHT7sRsX1lczERWJjuKgPDLKcGAAAACgAAAAAAAAAAAAAAAAAAAAEAAAAA'
const MOCKED_AUTH_ENTRY_B = xdr.SorobanAuthorizationEntry.fromXDR(MOCKED_AUTH_ENTRY_B_XDR, 'base64')

const MOCKED_AUTH_ENTRY_B_REQ_SIGNER = 'GCRPI6VYBJ2U7OGRBMI2XPQ7CICIU2KRD5MQ6366BECP3NDDW3UOP6HV'

const MOCKED_AUTH_ENTRY_SOURCE_XDR =
  'AAAAAAAAAAAAAAABTtqfrXuuo4yIBEW0azSfUHab0yKalJuUPxe/LGg6o7YAAAAIdHJhbnNmZXIAAAADAAAAEgAAAAAAAAAA+lIrHIESwBahZaC2Y1qy8V3ofBOcmfRqmYgk2MXmIDsAAAASAAAAAAAAAAC3qK45KNxeE/HNayxHRBU3O0+FQle0MkiVl4yuhRI0fwAAAAoAAAAAAAAAAAAAAAAAAAABAAAAAA=='
const MOCKED_AUTH_ENTRY_SOURCE = xdr.SorobanAuthorizationEntry.fromXDR(MOCKED_AUTH_ENTRY_SOURCE_XDR, 'base64')

const MOCKED_TRANSACTION_XDR =
  'AAAAAgAAAACPVHnhwyBwtNC/1qxeu9dTtItat/QecxIsa7H316JigQAPQkAADkkGAAAAAgAAAAEAAAAAAAAAAAAAAABmDYF/AAAAAAAAAAEAAAAAAAAAGAAAAAAAAAABZO1I84fUVotiBlmXL5LJ5Ogg8t/VGnViX2HQ/StJn9gAAAAIdHJhbnNmZXIAAAADAAAAEgAAAAAAAAAArb8JC0i36Dmfgz6KW5WQ0tnZdAEJokT6E14XqgChUA0AAAASAAAAAAAAAAD1QyBTyN4TsLVjLFeiqUGg1v9mIPqLlkQs4nVwsqGT+QAAAAoAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA'

const MOCKED_TRANSACTION = new Transaction(MOCKED_TRANSACTION_XDR, TESTNET_NETWORK_CONFIG.networkPassphrase)

const MOCKED_SIMULATION_RESPONSE_SUCCESS = {
  events: [],
  id: 'mocked-id',
  latestLedger: 0,
  _parsed: true,
  transactionData: new SorobanDataBuilder(),
  minResourceFee: '0',
  cost: {
    cpuInsns: '0',
    memBytes: '0',
  },
  result: {
    auth: [],
    xdr: 'mocked-xdr',
    retval: xdr.ScVal.scvVoid(),
  },
} as SorobanRpc.Api.SimulateTransactionSuccessResponse

const MOCKED_RPC = new DefaultRpcHandler(TESTNET_NETWORK_CONFIG)

const MOCKED_ACCOUNT_HANDLER_A = mockAccountHandler({ accountKey: MOCKED_PK_A })

const MOCKED_PIPELINE_ITEM = {
  transaction: MOCKED_TRANSACTION,
  simulation: MOCKED_SIMULATION_RESPONSE_SUCCESS,
  signers: [],
  rpcHandler: MOCKED_RPC,
} as SorobanAuthPipelineInput

const mockConveyorBeltErrorMeta = (
  item: SorobanAuthPipelineInput
): ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata> => {
  return {
    item,
    meta: {
      itemId: 'mocked-id',
      beltId: 'mocked-belt-id',
      beltType: SorobanAuthPipelineType.id,
    },
  } as ConveyorBeltErrorMeta<SorobanAuthPipelineInput, BeltMetadata>
}

describe('Soroban Auth Pipeline', () => {
  describe('Initialization', () => {
    it('should initialize the pipeline', () => {
      const pipeline = new SorobanAuthPipeline()

      expect(pipeline).toBeInstanceOf(SorobanAuthPipeline)
    })
  })

  describe('Process', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
    })

    it('should not sign the auth entries if there are no auth entries in the simulation nor additional entries provided', async () => {
      const pipeline = new SorobanAuthPipeline()
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation: MOCKED_SIMULATION_RESPONSE_SUCCESS,
        signers: [MOCKED_ACCOUNT_HANDLER_A],
      }

      const output = await pipeline.execute(mockedItem)

      expect(output).toEqual(MOCKED_TRANSACTION)
    })

    it('should not sign the auth entries if there are no auth entries in the simulation and additional entries are provided empty', async () => {
      const pipeline = new SorobanAuthPipeline()
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation: MOCKED_SIMULATION_RESPONSE_SUCCESS,
        signers: [MOCKED_ACCOUNT_HANDLER_A],
        additionalSorobanAuthToSign: [],
        additionalSignedSorobanAuth: [],
      }

      const output = await pipeline.execute(mockedItem)

      expect(output).toEqual(MOCKED_TRANSACTION)
    })

    it('should not sign the auth entries if there are only auth entries for source', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_SOURCE]
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [MOCKED_ACCOUNT_HANDLER_A],
        additionalSorobanAuthToSign: [],
        additionalSignedSorobanAuth: [],
      }

      const output = await pipeline.execute(mockedItem)

      expect(output).toEqual(MOCKED_TRANSACTION)
    })

    it('should not sign the auth entries if there is no result in the simulation', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result = undefined
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const spyMockSign = jest.spyOn(mockedSigner, 'signSorobanAuthEntry')
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [mockedSigner],
        additionalSorobanAuthToSign: [],
        additionalSignedSorobanAuth: [],
      }

      const output = await pipeline.execute(mockedItem)

      expect(output).toEqual(MOCKED_TRANSACTION)
      expect(spyMockSign).not.toHaveBeenCalled()
    })

    it('should sign the auth entries if there are auth entries for the transaction and the required signer', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const spyMockSign = jest.spyOn(mockedSigner, 'signSorobanAuthEntry')
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [mockedSigner],
      }

      const output = await pipeline.execute(mockedItem)

      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(output).toEqual(MOCKED_TRANSACTION_OUTPUT)
      expect(spyMockSign).toHaveBeenCalledOnce()
    })

    it('should sign the auth entries if there are auth entries for the transaction only with the required signer', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedSignerA = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const mockedSignerB = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_B_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_B,
      })
      const spyMockSignA = jest.spyOn(mockedSignerA, 'signSorobanAuthEntry')
      const spyMockSignB = jest.spyOn(mockedSignerB, 'signSorobanAuthEntry')
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [mockedSignerA],
      }

      const output = await pipeline.execute(mockedItem)

      expect(MOCKED_SIMULATE_TRANSACTION_PIPELINE).toHaveBeenCalledOnce()
      expect(output).toEqual(MOCKED_TRANSACTION_OUTPUT)
      expect(spyMockSignA).toHaveBeenCalledOnce()
      expect(spyMockSignB).not.toHaveBeenCalled()
    })

    it('should use the transaction timeout to calculate auth timeout', async () => {
      const latestLedger = 1000
      MOCKED_DEFAULT_RPC_HANDLER.mockImplementationOnce(() => {
        return {
          getLatestLedger: jest.fn().mockImplementation(() => {
            return {
              sequence: latestLedger,
            }
          }),
        }
      })
      const currentTime = 1000
      jest.setSystemTime(currentTime)
      const timeout = Number(MOCKED_TRANSACTION.timeBounds?.maxTime) - currentTime / 1000
      const expectedExpiration = Number((latestLedger + timeout / 5 + 1).toFixed(0))
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const spyMockSign = jest.spyOn(mockedSigner, 'signSorobanAuthEntry')
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [mockedSigner],
        rpcHandler: new DefaultRpcHandler(TESTNET_NETWORK_CONFIG),
      }

      await pipeline.execute(mockedItem)

      expect(spyMockSign).toHaveBeenCalledWith(
        MOCKED_AUTH_ENTRY_A,
        expectedExpiration,
        TESTNET_NETWORK_CONFIG.networkPassphrase
      )
    })
  })

  it('should use the default timeout to calculate auth timeout when the transaction has no timeout', async () => {
    const latestLedger = 500
    MOCKED_DEFAULT_RPC_HANDLER.mockImplementationOnce(() => {
      return {
        getLatestLedger: jest.fn().mockImplementation(() => {
          return {
            sequence: latestLedger,
          }
        }),
      }
    })
    const currentTime = 1000
    jest.useFakeTimers()
    jest.setSystemTime(currentTime)
    const mockedTransactionWithoutTimeout = TransactionBuilder.cloneFrom(MOCKED_TRANSACTION, {
      fee: '100',
      networkPassphrase: TESTNET_NETWORK_CONFIG.networkPassphrase,
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
    }).build()
    const defaultValue = 600
    const timeout = Number(defaultValue)
    const expectedExpiration = Number((latestLedger + timeout / 5 + 1).toFixed(0))
    const pipeline = new SorobanAuthPipeline()
    const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
    if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
    const mockedSigner = mockAccountHandler({
      accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
      outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
    })
    const spyMockSign = jest.spyOn(mockedSigner, 'signSorobanAuthEntry')
    const mockedItem = {
      ...MOCKED_PIPELINE_ITEM,
      transaction: mockedTransactionWithoutTimeout,
      simulation,
      signers: [mockedSigner],
      rpcHandler: new DefaultRpcHandler(TESTNET_NETWORK_CONFIG),
    }

    await pipeline.execute(mockedItem)

    expect(spyMockSign).toHaveBeenCalledWith(
      MOCKED_AUTH_ENTRY_A,
      expectedExpiration,
      TESTNET_NETWORK_CONFIG.networkPassphrase
    )
  })

  describe('Errors', () => {
    it('should throw if there are entries to sign but no signers are provided', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [],
        additionalSorobanAuthToSign: [],
        additionalSignedSorobanAuth: [],
      }

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        PSAError.noSignersProvided(mockConveyorBeltErrorMeta(mockedItem))
      )
    })

    it('should throw if there are entries to sign but the required signers are not provided', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_B]
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [MOCKED_ACCOUNT_HANDLER_A],
        additionalSorobanAuthToSign: [],
        additionalSignedSorobanAuth: [],
      }

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        PSAError.signerNotFound(
          mockConveyorBeltErrorMeta(mockedItem),
          MOCKED_TRANSACTION,
          [MOCKED_PK_A],
          MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
          MOCKED_AUTH_ENTRY_A
        )
      )
    })

    it('should throw error if updateTransaction fails', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const spyMockSign = jest.spyOn(mockedSigner, 'signSorobanAuthEntry')
      const faultyTransaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build() // Transaction with no operations should cause the updateTransaction to fail
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: faultyTransaction,
        simulation,
        signers: [mockedSigner],
      }

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        PSAError.couldntUpdateTransaction(
          new Error('Mocked Error'),
          mockConveyorBeltErrorMeta(mockedItem),
          MOCKED_TRANSACTION,
          [MOCKED_AUTH_ENTRY_A]
        )
      )
      expect(spyMockSign).toHaveBeenCalledOnce()
    })

    it('should throw error if simulation fails', async () => {
      const pipeline = new SorobanAuthPipeline()
      const simulation = { ...MOCKED_SIMULATION_RESPONSE_SUCCESS } as SorobanRpc.Api.SimulateTransactionSuccessResponse
      if (simulation.result) simulation.result.auth = [MOCKED_AUTH_ENTRY_A]
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_AUTH_ENTRY_A_REQ_SIGNER,
        outputSignedAuthEntry: MOCKED_AUTH_ENTRY_A,
      })
      const mockedItem = {
        ...MOCKED_PIPELINE_ITEM,
        transaction: MOCKED_TRANSACTION,
        simulation,
        signers: [mockedSigner],
      }
      MOCKED_SIMULATE_TRANSACTION_PIPELINE.mockImplementationOnce(() => {
        return {
          execute: (): void => {
            throw new Error('Mocked Error')
          },
        }
      })

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        PSAError.couldntSimulateAuthorizedTransaction(
          new Error('Mocked Error'),
          mockConveyorBeltErrorMeta(mockedItem),
          MOCKED_TRANSACTION,
          [MOCKED_AUTH_ENTRY_A]
        )
      )
    })
  })
})
