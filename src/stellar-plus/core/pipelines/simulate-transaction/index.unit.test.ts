import { Account, SorobanDataBuilder, rpc as SorobanRpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

import { SimulateTransactionPipeline } from 'stellar-plus/core/pipelines/simulate-transaction'
import { PSIError } from 'stellar-plus/core/pipelines/simulate-transaction/errors'
import {
  SimulateTransactionPipelineInput,
  SimulateTransactionPipelineType,
} from 'stellar-plus/core/pipelines/simulate-transaction/types'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { TestNet } from 'stellar-plus/network'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

const MOCKED_SIMULATION_RESPONSE_BASE = {
  events: [],
  id: 'mocked-id',
  latestLedger: 0,
  _parsed: true,
}
const MOCKED_SIMULATION_RESPONSE_ERROR = {
  ...MOCKED_SIMULATION_RESPONSE_BASE,
  error: 'mocked error',
} as SorobanRpc.Api.SimulateTransactionErrorResponse

const MOCKED_SIMULATION_RESPONSE_SUCCESS = {
  ...MOCKED_SIMULATION_RESPONSE_BASE,
  transactionData: new SorobanDataBuilder(),
  minResourceFee: '0',
  cost: {
    cpuInsns: '0',
    memBytes: '0',
  },
} as SorobanRpc.Api.SimulateTransactionSuccessResponse

const MOCKED_SIMULATION_RESPONSE_RESTORE = {
  ...MOCKED_SIMULATION_RESPONSE_SUCCESS,
  result: {
    auth: [],
    xdr: 'mocked-xdr',
    retval: xdr.ScVal.scvVoid(),
  },
  restorePreamble: {
    minResourceFee: '0',
    transactionData: new SorobanDataBuilder(),
  },
} as SorobanRpc.Api.SimulateTransactionRestoreResponse

const MOCKED_INVALID_SIMULATION_RESPONSE =
  MOCKED_SIMULATION_RESPONSE_BASE as unknown as SorobanRpc.Api.SimulateTransactionResponse

const MOCKED_PK_A = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_ACCOUNT_A = new Account(MOCKED_PK_A, '100')
const TESTNET_PASSPHRASE = TestNet().networkPassphrase
const MOCKED_FEE = '100'
const MOCKED_TX_OPTIONS: TransactionBuilder.TransactionBuilderOptions = {
  fee: MOCKED_FEE,
  networkPassphrase: TESTNET_PASSPHRASE,
  timebounds: {
    minTime: 0,
    maxTime: 0,
  },
}
const MOCKED_TRANSACTION = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
const MOCKED_EXCEPTION = new Error('simulateTransaction failed')

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
  describe('Initialization', () => {
    it('should initialize the pipeline successfully', async () => {
      const pipeline = new SimulateTransactionPipeline()
      expect(pipeline).toBeInstanceOf(SimulateTransactionPipeline)
    })
  })

  describe('errors', () => {
    it('should throw failedToSimulateTransaction error when simulateTransaction fails to perform the simulation', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          throw MOCKED_EXCEPTION
        }),
      } as unknown as RpcHandler
      const pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      await expect(pipeline.execute(item)).rejects.toThrow(
        PSIError.failedToSimulateTransaction(MOCKED_EXCEPTION, mockConveyorBeltErrorMeta(item))
      )
    })

    it('should throw simulationFailed error when simulateTransaction provides a simulation that will fail to be executed', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          return MOCKED_SIMULATION_RESPONSE_ERROR
        }),
      } as unknown as RpcHandler

      const pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      await expect(pipeline.execute(item)).rejects.toThrow(
        PSIError.simulationFailed(MOCKED_SIMULATION_RESPONSE_ERROR, mockConveyorBeltErrorMeta(item))
      )
    })

    it('should throw simulationResultCouldNotBeVerified error when simulateTransaction provides a simulation that cannot be verified', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          return MOCKED_INVALID_SIMULATION_RESPONSE
        }),
      } as unknown as RpcHandler
      const pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      await expect(pipeline.execute(item)).rejects.toThrow(
        PSIError.simulationResultCouldNotBeVerified(MOCKED_INVALID_SIMULATION_RESPONSE, mockConveyorBeltErrorMeta(item))
      )
    })

    it('should throw failedToAssembleTransaction error when assembleTransaction fails to assemble the transaction', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          return MOCKED_SIMULATION_RESPONSE_SUCCESS
        }),
      } as unknown as RpcHandler
      const pipeline = new SimulateTransactionPipeline()
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      await expect(pipeline.execute(item)).rejects.toThrow('Failed to assemble transaction!')
    })
  })

  describe('success', () => {
    it('should return a successful response when simulateTransaction provides a simulation that can be verified as successfull', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          return MOCKED_SIMULATION_RESPONSE_SUCCESS
        }),
      } as unknown as RpcHandler
      const pipeline = new SimulateTransactionPipeline()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(pipeline as any, 'assembleTransaction').mockImplementation(() => {
        return MOCKED_TRANSACTION
      })
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      expect(await pipeline.execute(item)).toEqual({
        response: MOCKED_SIMULATION_RESPONSE_SUCCESS,
        assembledTransaction: MOCKED_TRANSACTION,
      })
    })

    it('should return a successful response when simulateTransaction provides a simulation that can be verified as successfull but needs to be restored', async () => {
      const MOCKED_RPC = {
        simulateTransaction: jest.fn().mockImplementation(() => {
          return MOCKED_SIMULATION_RESPONSE_RESTORE
        }),
      } as unknown as RpcHandler
      const pipeline = new SimulateTransactionPipeline()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(pipeline as any, 'assembleTransaction').mockImplementation(() => {
        return MOCKED_TRANSACTION
      })
      const item = {
        transaction: MOCKED_TRANSACTION,
        rpcHandler: MOCKED_RPC,
      }

      expect(await pipeline.execute(item)).toEqual({
        response: MOCKED_SIMULATION_RESPONSE_RESTORE,
        assembledTransaction: MOCKED_TRANSACTION,
      })
    })
  })
})
