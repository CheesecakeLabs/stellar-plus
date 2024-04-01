import { FeeBumpTransaction, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

import {
  FeeBumpPipelineInput as FBInput,
  FeeBumpPipelineOutput as FBOutput,
} from 'stellar-plus/core/pipelines/fee-bump/types'

import { FeeBumpPipeline } from '.'

jest.mock('@stellar/stellar-sdk', () => ({
  Horizon: {
    Server: jest.fn(),
  },
  Transaction: jest.fn(() => {
    return {
      networkPassphrase: 'networkPassphrase',
      toXDR: jest.fn(() => {
        return 'toXDR'
      }),
    }
  }),
  TransactionBuilder: {
    fromXDR: jest.fn(() => {
      return {}
    }),
    buildFeeBumpTransaction: jest.fn(() => {
      return {}
    }),
  },
}))

const MOCKED_BUMP_FEE = '101'

const MOCKED_TRANSACTION = {
  networkPassphrase: 'networkPassphrase',
  toXDR: jest.fn(() => 'toXDR'),
} as unknown as Transaction
const MOCKED_FEE_BUMPED_TRANSACTION: FeeBumpTransaction = {} as FeeBumpTransaction
const MOCKED_BT_INPUT: FBInput = {
  innerTransaction: MOCKED_TRANSACTION,
  feeBumpHeader: {
    header: {
      source: 'source',
      fee: MOCKED_BUMP_FEE,
      timeout: 2,
    },
    signers: [],
  },
}
const MOCKED_BT_OUTPUT: FBOutput = MOCKED_FEE_BUMPED_TRANSACTION

describe('FeeBumpPipeline', () => {
  let feeBumpPipeline: FeeBumpPipeline

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Wrap Transaction', () => {
    beforeEach(() => {
      feeBumpPipeline = new FeeBumpPipeline()
      jest.clearAllMocks()
    })

    it('should wrap transaction successfully', async () => {
      await expect(feeBumpPipeline.execute(MOCKED_BT_INPUT)).resolves.toEqual(MOCKED_BT_OUTPUT)
      expect(TransactionBuilder.fromXDR).toHaveBeenCalledTimes(1)
      expect(TransactionBuilder.buildFeeBumpTransaction).toHaveBeenCalledTimes(1)
      expect(TransactionBuilder.buildFeeBumpTransaction).toHaveBeenCalledWith(
        MOCKED_BT_INPUT.feeBumpHeader.header.source,
        MOCKED_BT_INPUT.feeBumpHeader.header.fee,
        {},
        'networkPassphrase'
      )
    })

    it('should throw error', async () => {
      const mockedInput = {
        ...MOCKED_BT_INPUT,
        feeBumpHeader: {
          ...MOCKED_BT_INPUT.feeBumpHeader,
          header: {
            ...MOCKED_BT_INPUT.feeBumpHeader.header,
            fee: '0',
          },
        },
      }
      ;(TransactionBuilder.buildFeeBumpTransaction as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error building fee bump transaction!')
      })

      await expect(feeBumpPipeline.execute(mockedInput)).rejects.toThrow('Unexpected error!')
      expect(TransactionBuilder.fromXDR).toHaveBeenCalledTimes(1)
      expect(TransactionBuilder.buildFeeBumpTransaction).toHaveBeenCalledTimes(1)
      expect(TransactionBuilder.buildFeeBumpTransaction).toHaveBeenCalledWith(
        MOCKED_BT_INPUT.feeBumpHeader.header.source,
        '0',
        {},
        'networkPassphrase'
      )
    })
  })
})
