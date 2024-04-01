import { Account, TransactionBuilder } from '@stellar/stellar-base'
import { SorobanRpc } from '@stellar/stellar-sdk'

import { Constants } from 'stellar-plus'
import { SimulateTransactionPipeline } from 'stellar-plus/core/pipelines/simulate-transaction'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { NetworkConfig } from 'stellar-plus/types'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { PSIError } from './errors'
import { SimulateTransactionPipelineInput, SimulateTransactionPipelineType } from './types'

jest.mock('stellar-plus/rpc/default-handler', () => ({
  DefaultRpcHandler: jest.fn().mockImplementation(() => {
    return {
      type: 'RpcHandler',
      networkConfig: {} as NetworkConfig,
      server: jest.fn(),
      getTransaction: jest.fn(),
      getLatestLedger: jest.fn(),
      getHealth: jest.fn(),
      getNetwork: jest.fn(),
      getEvents: jest.fn(),
      getLedgerEntries: jest.fn(),
      simulateTransaction: jest.fn(),
      prepareTransaction: jest.fn(),
      submitTransaction: jest.fn(),
    }
  }),
}))

const MOCKED_RPC_HANDLER = DefaultRpcHandler as jest.MockedClass<typeof DefaultRpcHandler>

const MOCKED_SIMULATION_RESPONSE_ERROR = {
  error: 'mocked error',
  events: [],
  id: 'mocked-id',
  latestLedger: 0,
  _parsed: true,
} as SorobanRpc.Api.SimulateTransactionErrorResponse

const MOCKED_PK_A = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
// const MOCKED_PK_B = 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P'
// const MOCKED_PK_C = 'GCPXAF4S5MBXA3DRNBA7XYP55S6F3UN2ZJRAS72BXEJMD7JVMGIGCKNA'

const MOCKED_ACCOUNT_A = new Account(MOCKED_PK_A, '100')

const TESTNET_PASSPHRASE = Constants.testnet.networkPassphrase
const MOCKED_FEE = '100'
// const MOCKED_BUMP_FEE = '101'

const MOCKED_TX_OPTIONS: TransactionBuilder.TransactionBuilderOptions = {
  fee: MOCKED_FEE,
  networkPassphrase: TESTNET_PASSPHRASE,
  timebounds: {
    minTime: 0,
    maxTime: 0,
  },
}

const mockConveyorBeltErrorMeta = (
  item: SimulateTransactionPipelineInput
): ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata> => {
  return {
    item,
    meta: {
      itemId: 'mocked-id',
      beltId: 'mocked-belt-id',
      beltType: SimulateTransactionPipelineType.id,
    },
  } as ConveyorBeltErrorMeta<SimulateTransactionPipelineInput, BeltMetadata>
}

describe('SimulateTransactionPipeline', () => {
  let pipeline: SimulateTransactionPipeline
  beforeEach(() => {
    pipeline = new SimulateTransactionPipeline()
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize the pipeline successfully', async () => {
      expect(pipeline).toBeInstanceOf(SimulateTransactionPipeline)
    })
  })

  describe('errors', () => {
    it('should throw failedToSimulateTransaction error when simulateTransaction fails to perform the simulation', async () => {
      const MOCKED_EXCEPTION = new Error('simulateTransaction failed')
      MOCKED_RPC_HANDLER.prototype.simulateTransaction = jest.fn().mockRejectedValueOnce(MOCKED_EXCEPTION)
      pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build(),
        rpcHandler: MOCKED_RPC_HANDLER as unknown as RpcHandler,
      }

      await expect(pipeline.execute(item)).rejects.toThrow(
        PSIError.failedToSimulateTransaction(MOCKED_EXCEPTION, mockConveyorBeltErrorMeta(item))
      )
    })

    it('should throw simulationFailed error when simulateTransaction provides a simulation that will fail to be executed', async () => {
      MOCKED_RPC_HANDLER.prototype.simulateTransaction = jest
        .fn()
        .mockResolvedValueOnce(MOCKED_SIMULATION_RESPONSE_ERROR)
      pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build(),
        rpcHandler: MOCKED_RPC_HANDLER as unknown as RpcHandler,
      }

      await expect(pipeline.execute(item)).rejects.toThrow(
        PSIError.simulationFailed(MOCKED_SIMULATION_RESPONSE_ERROR, mockConveyorBeltErrorMeta(item))
      )
    })
  })
})
