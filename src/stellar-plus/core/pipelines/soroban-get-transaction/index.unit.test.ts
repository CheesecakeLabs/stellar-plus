import { Account, rpc as SorobanRpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

import { SorobanGetTransactionPipeline } from 'stellar-plus/core/pipelines/soroban-get-transaction'
import { SGTError } from 'stellar-plus/core/pipelines/soroban-get-transaction/errors'
import {
  SorobanGetTransactionOptions,
  SorobanGetTransactionPipelineInput,
  SorobanGetTransactionPipelinePlugin,
  SorobanGetTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-get-transaction/types'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { TestNet } from 'stellar-plus/network'
import { DefaultRpcHandler } from 'stellar-plus/rpc/default-handler'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

jest.mock('stellar-plus/rpc/default-handler', () => ({
  DefaultRpcHandler: jest.fn().mockImplementation(() => ({
    getTransaction: jest.fn(),
  })),
}))

const MOCKED_RPC_HANDLER = DefaultRpcHandler as jest.Mock

const TESTNET_CONFIG = TestNet()
const MOCKED_PK_A = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_ACCOUNT_A = new Account(MOCKED_PK_A, '100')

const MOCKED_TX_OPTIONS: TransactionBuilder.TransactionBuilderOptions = {
  fee: '100',
  networkPassphrase: TESTNET_CONFIG.networkPassphrase,
  timebounds: {
    minTime: 0,
    maxTime: 0,
  },
}

const MOCKED_SOROBAN_SUBMISSION = {
  status: 'PENDING',
  hash: 'mocked-hash',
  latestLedger: 0,
  latestLedgerCloseTime: 0,
} as SorobanRpc.Api.SendTransactionResponse

const MOCKED_SUCCESSFUL_RESPONSE = {
  status: SorobanRpc.Api.GetTransactionStatus.SUCCESS,
} as SorobanRpc.Api.GetSuccessfulTransactionResponse

const MOCKED_FAILED_RESPONSE = {
  status: SorobanRpc.Api.GetTransactionStatus.FAILED,
  resultXdr: xdr.TransactionResult.fromXDR('AAAAAAAAAGT////4AAAAAA==', 'base64'),
  resultMetaXdr: xdr.TransactionMeta.fromXDR(
    'AAAAAwAAAAAAAAACAAAAAwAOgggAAAAAAAAAAFBASCSXn/T00voyqd7Oqs2WBynZaF3xrCVh+ffvMXR7AAAAF0h255wADoHgAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAOgggAAAAAAAAAAFBASCSXn/T00voyqd7Oqs2WBynZaF3xrCVh+ffvMXR7AAAAF0h255wADoHgAAAAAQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAA6CCAAAAABmDqzhAAAAAAAAAAEAAAAAAAAAAAAAAAA=',
    'base64'
  ),
} as SorobanRpc.Api.GetFailedTransactionResponse

const MOCKED_MISSING_RESPONSE = {
  status: SorobanRpc.Api.GetTransactionStatus.NOT_FOUND,
} as SorobanRpc.Api.GetMissingTransactionResponse

const mockConveyorBeltErrorMeta = (
  item: SorobanGetTransactionPipelineInput
): ConveyorBeltErrorMeta<SorobanGetTransactionPipelineInput, BeltMetadata> => {
  return {
    item,
    meta: {
      itemId: 'mocked-id',
      beltId: 'mocked-belt-id',
      beltType: SorobanGetTransactionPipelineType.id,
    },
  } as ConveyorBeltErrorMeta<SorobanGetTransactionPipelineInput, BeltMetadata>
}

describe('SorobanGetTransaction', () => {
  describe('Initialize', () => {
    it('should initialize the pipeline', async () => {
      const pipeline = new SorobanGetTransactionPipeline()

      expect(pipeline).toBeDefined()
    })

    it('should initialize the pipeline with the default options', async () => {
      const pipeline = new SorobanGetTransactionPipeline()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const mockedOptions = jest.mocked((pipeline as any).options)

      expect(mockedOptions).toBeDefined()
      expect((mockedOptions as unknown as SorobanGetTransactionOptions).defaultSecondsToWait).toBe(30)
      expect((mockedOptions as unknown as SorobanGetTransactionOptions).useEnvelopeTimeout).toBe(true)
    })

    it('should initialize the pipeline with the given options', async () => {
      const customOptions = {
        defaultSecondsToWait: 10,
        useEnvelopeTimeout: false,
      }
      const pipeline = new SorobanGetTransactionPipeline({ options: customOptions })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const spyOptions = jest.mocked((pipeline as any).options)

      expect(spyOptions).toBeDefined()
      expect((spyOptions as unknown as SorobanGetTransactionOptions).defaultSecondsToWait).toBe(
        customOptions.defaultSecondsToWait
      )
      expect((spyOptions as unknown as SorobanGetTransactionOptions).useEnvelopeTimeout).toBe(
        customOptions.useEnvelopeTimeout
      )
    })

    it('should initialize the pipeline with the given plugins', async () => {
      const mockedPlugin = jest.fn().mockImplementation(() => ({
        preProcess: jest.fn(),
        type: SorobanGetTransactionPipelineType.id,
      })) as unknown as SorobanGetTransactionPipelinePlugin
      const customPlugins = [mockedPlugin]
      const pipeline = new SorobanGetTransactionPipeline({ plugins: customPlugins })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const spyPlugins = jest.mocked((pipeline as any).plugins)

      expect(spyPlugins).toBeDefined()
      expect(spyPlugins).toBe(customPlugins)
    })
  })

  describe('Core functionalities', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should process the transaction and return if successful', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockResolvedValue(MOCKED_SUCCESSFUL_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const mockedTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline()
      const spyGetTransaction = jest.spyOn(mockedRpcHandler, 'getTransaction')

      const response = await pipeline.execute(mockedItem)

      expect(response).toBeDefined()
      expect(response).toEqual({ response: MOCKED_SUCCESSFUL_RESPONSE })
      expect(spyGetTransaction).toHaveBeenCalledTimes(1)
      expect(spyGetTransaction).toHaveBeenCalledWith(MOCKED_SOROBAN_SUBMISSION.hash)
    })

    it('should process the transaction and continue trying if missing', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest
          .fn()
          .mockResolvedValue(MOCKED_SUCCESSFUL_RESPONSE)
          .mockResolvedValueOnce(MOCKED_MISSING_RESPONSE)
          .mockResolvedValueOnce(MOCKED_MISSING_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const mockedTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline()
      const spyGetTransaction = jest.spyOn(mockedRpcHandler, 'getTransaction')

      const response = await pipeline.execute(mockedItem)

      expect(response).toBeDefined()
      expect(response).toEqual({ response: MOCKED_SUCCESSFUL_RESPONSE })
      expect(spyGetTransaction).toHaveBeenCalledTimes(3)
      expect(spyGetTransaction).toHaveBeenCalledWith(MOCKED_SOROBAN_SUBMISSION.hash)
    })

    it('should get the timeout from the transaction envelope when useEnvelopeTimeout is true', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockResolvedValue(MOCKED_SUCCESSFUL_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const timeoutSeconds = 100
      const mockedTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .setTimeout(timeoutSeconds)
        .build()
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline({
        options: { defaultSecondsToWait: 30, useEnvelopeTimeout: true },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyGetSecondsToWait = jest.spyOn(pipeline as any, 'getSecondsToWait')

      await pipeline.execute(mockedItem)

      expect(spyGetSecondsToWait).toHaveBeenCalledTimes(1)
      expect(spyGetSecondsToWait).toHaveReturnedWith(timeoutSeconds)
    })

    it('should get the timeout from the inner transaction envelope when useEnvelopeTimeout is true and transaction is a fee bump', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockResolvedValue(MOCKED_SUCCESSFUL_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const timeoutSeconds = 17
      const mockedInnerTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .setTimeout(timeoutSeconds)
        .build()
      const mockedFeeBumpTransactionEnvelope = TransactionBuilder.buildFeeBumpTransaction(
        MOCKED_PK_A,
        MOCKED_TX_OPTIONS.fee + 1, // Fee bump fee needs to be higher than ineer transaction fee
        mockedInnerTransactionEnvelope,
        TESTNET_CONFIG.networkPassphrase
      )
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedFeeBumpTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline({
        options: { defaultSecondsToWait: 30, useEnvelopeTimeout: true },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyGetSecondsToWait = jest.spyOn(pipeline as any, 'getSecondsToWait')

      await pipeline.execute(mockedItem)

      expect(spyGetSecondsToWait).toHaveBeenCalledTimes(1)
      expect(spyGetSecondsToWait).toHaveReturnedWith(timeoutSeconds)
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw an error if the transaction failed', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockResolvedValue(MOCKED_FAILED_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const mockedTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline()

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        SGTError.transactionFailed(mockConveyorBeltErrorMeta(mockedItem), MOCKED_FAILED_RESPONSE)
      )
    })

    it('should throw an error if the transaction is not found', async () => {
      MOCKED_RPC_HANDLER.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockResolvedValue(MOCKED_MISSING_RESPONSE),
      }))
      const mockedRpcHandler = new DefaultRpcHandler(TESTNET_CONFIG)
      const mockedTransactionEnvelope = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const mockedItem = {
        rpcHandler: mockedRpcHandler,
        sorobanSubmission: MOCKED_SOROBAN_SUBMISSION,
        transactionEnvelope: mockedTransactionEnvelope,
      }
      const pipeline = new SorobanGetTransactionPipeline({
        options: { defaultSecondsToWait: 3, useEnvelopeTimeout: false },
      })

      await expect(pipeline.execute(mockedItem)).rejects.toThrow(
        SGTError.transactionNotFound(mockConveyorBeltErrorMeta(mockedItem), 30, MOCKED_SOROBAN_SUBMISSION.hash)
      )
    })
  })
})
