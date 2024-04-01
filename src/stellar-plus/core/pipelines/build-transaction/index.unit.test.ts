import { Asset, Operation } from '@stellar/stellar-base'
import { Horizon, TransactionBuilder } from '@stellar/stellar-sdk'
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon'

import { testnet } from 'stellar-plus/constants'
import {
  BuildTransactionPipelineInput as BTInput,
  BuildTransactionPipelineOutput as BTOutput,
} from 'stellar-plus/core/pipelines/build-transaction/types'
import { HorizonHandler } from 'stellar-plus/horizon/types'

import { BuildTransactionPipeline } from '.'

jest.mock('@stellar/stellar-sdk', () => ({
  Horizon: {
    Server: jest.fn(),
  },
  Account: jest.fn(),
  TransactionBuilder: jest.fn(() => {
    return {
      addOperation: jest.fn(),
      setTimeout: jest.fn(),
      setSorobanData: jest.fn(() => {
        return {}
      }),
      build: jest.fn(() => {
        return {}
      }),
    }
  }),
}))

export function createMockedHorizonHandler(): jest.Mocked<HorizonHandler> {
  return {
    loadAccount: jest.fn().mockResolvedValue({} as AccountResponse),
    server: new Horizon.Server(testnet.horizonUrl),
  }
}

const mockedHorizonHandler = createMockedHorizonHandler()

const MOCKED_BT_INPUT: BTInput = {
  header: {
    source: 'source',
    fee: '100',
    timeout: 2,
  },
  horizonHandler: mockedHorizonHandler,
  operations: [],
  networkPassphrase: 'networkPassphrase',
}
const MOCKED_BT_OUTPUT: BTOutput = {} as BTOutput

describe('BuildTransactionPipeline', () => {
  let buildTransactionPipeline: BuildTransactionPipeline

  beforeEach(() => {
    jest.clearAllMocks()
    mockedHorizonHandler.loadAccount.mockClear()
  })

  describe('Load Account', () => {
    beforeEach(() => {
      buildTransactionPipeline = new BuildTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should load account successfully', async () => {
      await buildTransactionPipeline.execute(MOCKED_BT_INPUT)

      expect(mockedHorizonHandler.loadAccount).toHaveBeenCalledWith('source')
      expect(mockedHorizonHandler.loadAccount).toHaveBeenCalledTimes(1)
    })

    it('should throw error', async () => {
      mockedHorizonHandler.loadAccount.mockRejectedValueOnce(new Error('error'))

      await expect(buildTransactionPipeline.execute(MOCKED_BT_INPUT)).rejects.toThrow('Could not load account!')
      expect(mockedHorizonHandler.loadAccount).toHaveBeenCalledWith('source')
      expect(mockedHorizonHandler.loadAccount).toHaveBeenCalledTimes(1)
    })
  })

  describe('Build Envelope', () => {
    const transactionBuilderOptions = {
      fee: MOCKED_BT_INPUT.header.fee,
      networkPassphrase: MOCKED_BT_INPUT.networkPassphrase,
    }

    beforeEach(() => {
      buildTransactionPipeline = new BuildTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should create envelope successfully', async () => {
      await buildTransactionPipeline.execute(MOCKED_BT_INPUT)

      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should add sorobanData successfully', async () => {
      await buildTransactionPipeline.execute({
        ...MOCKED_BT_INPUT,
        sorobanData: 'sorobanData',
      })

      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should add single operation successfully', async () => {
      await buildTransactionPipeline.execute({
        ...MOCKED_BT_INPUT,
        operations: [
          Operation.payment({
            destination: 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P',
            asset: Asset.native(),
            amount: '100',
          }),
        ],
      })

      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should add multiple operation successfully', async () => {
      await buildTransactionPipeline.execute({
        ...MOCKED_BT_INPUT,
        operations: [
          Operation.payment({
            destination: 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P',
            asset: Asset.native(),
            amount: '100',
          }),
          Operation.payment({
            destination: 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P',
            asset: Asset.native(),
            amount: '100',
          }),
          Operation.payment({
            destination: 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P',
            asset: Asset.native(),
            amount: '100',
          }),
        ],
      })

      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should throw error', async () => {
      ;(TransactionBuilder as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('error')
      })

      await expect(buildTransactionPipeline.execute(MOCKED_BT_INPUT)).rejects.toThrow(
        'Could not create transaction builder!'
      )
      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should throw error adding sorobanData', async () => {
      ;(TransactionBuilder as unknown as jest.Mock).mockImplementationOnce(() => {
        return {
          setSorobanData: jest.fn(() => {
            throw new Error('error')
          }),
        }
      })

      await expect(
        buildTransactionPipeline.execute({
          ...MOCKED_BT_INPUT,
          sorobanData: 'sorobanData',
        })
      ).rejects.toThrow('Could not set Soroban data!')
      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should throw error adding operation', async () => {
      ;(TransactionBuilder as unknown as jest.Mock).mockImplementationOnce(() => {
        return {
          addOperation: jest.fn(() => {
            throw new Error('error')
          }),
        }
      })

      await expect(
        buildTransactionPipeline.execute({
          ...MOCKED_BT_INPUT,
          operations: [
            Operation.payment({
              destination: 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P',
              asset: Asset.native(),
              amount: '100',
            }),
          ],
        })
      ).rejects.toThrow('Could not add operations!')
      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })

    it('should throw error building operation', async () => {
      ;(TransactionBuilder as unknown as jest.Mock).mockImplementationOnce(() => {
        return {
          setTimeout: jest.fn(),
          build: jest.fn(() => {
            throw new Error('error')
          }),
        }
      })

      await expect(buildTransactionPipeline.execute(MOCKED_BT_INPUT)).rejects.toThrow('Could not build transaction!')
      expect(TransactionBuilder).toHaveBeenCalledWith({}, transactionBuilderOptions)
    })
  })

  describe('Process', () => {
    beforeEach(() => {
      buildTransactionPipeline = new BuildTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should build transaction successfully', async () => {
      await expect(buildTransactionPipeline.execute(MOCKED_BT_INPUT)).resolves.toEqual(MOCKED_BT_OUTPUT)
    })
  })
})
