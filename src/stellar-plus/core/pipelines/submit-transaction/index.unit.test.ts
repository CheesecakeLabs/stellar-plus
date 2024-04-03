import { SorobanRpc, TransactionBuilder } from '@stellar/stellar-sdk'

import { testnet } from 'stellar-plus/constants'
import { SubmitTransactionPipeline } from 'stellar-plus/core/pipelines/submit-transaction'
import {
  SubmitTransactionPipelineInput as STInput,
  SubmitTransactionPipelineOutput as STOutput,
} from 'stellar-plus/core/pipelines/submit-transaction/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon'
import { DefaultRpcHandler } from 'stellar-plus/rpc'

const TESTNET_PASSPHRASE = testnet.networkPassphrase
const MOCKED_TRANSACTION_XDR =
  'AAAAAgAAAAC8CrO4sEcs28O8U8KWvl4CpiGpCgRlbEwf2fp21SRe0gAAAGQADg/kAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB1SRe0gAAAEBH30tw2MS4pbpLZ8RbEBTLxF2xalFGJRLfDhgcbildNTgujl6hbNxmw2qltop/SZfe34R4q9v+KVhp5pQ4DmkL'
const MOCKED_TRANSACTION = TransactionBuilder.fromXDR(MOCKED_TRANSACTION_XDR, TESTNET_PASSPHRASE)
const MOCKED_ST_OUTPUT: STOutput = {
  response: {
    successful: true,
    hash: 'hash',
    ledger: 1,
    envelope_xdr: 'envelope_xdr',
    result_xdr: 'result_xdr',
    result_meta_xdr: 'result_meta_xdr',
    paging_token: 'paging_token',
  },
}
const HORIZON_HANDLER = new HorizonHandlerClient(testnet)
const RPC_HANDLER = new DefaultRpcHandler(testnet)
const MOCKED_ST_INPUT: STInput = {
  transaction: MOCKED_TRANSACTION,
  networkHandler: HORIZON_HANDLER,
}

describe('SubmitTransactionPipeline', () => {
  let submitTransactionPipeline: SubmitTransactionPipeline

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw error if received handler is neither horizon or rpc', async () => {
    submitTransactionPipeline = new SubmitTransactionPipeline()
    const MOCKED_INVALID_HANDLER = {} as unknown as HorizonHandlerClient

    await expect(
      submitTransactionPipeline.execute({
        ...MOCKED_ST_INPUT,
        networkHandler: MOCKED_INVALID_HANDLER,
      })
    ).rejects.toThrow('Invalid network handler!')
    expect(HORIZON_HANDLER.server.submitTransaction).not.toHaveBeenCalledOnce()
  })

  describe('Submit Transaction with HorizonHandler', () => {
    beforeEach(() => {
      submitTransactionPipeline = new SubmitTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should submit transaction successfully', async () => {
      HORIZON_HANDLER.server.submitTransaction = jest.fn().mockResolvedValue(MOCKED_ST_OUTPUT.response)

      await expect(submitTransactionPipeline.execute(MOCKED_ST_INPUT)).resolves.toEqual(MOCKED_ST_OUTPUT)
      expect(HORIZON_HANDLER.server.submitTransaction).toHaveBeenCalledWith(MOCKED_TRANSACTION, {
        skipMemoRequiredCheck: true,
      })
    })

    it('should throw error if something went wrong', async () => {
      HORIZON_HANDLER.server.submitTransaction = jest.fn().mockRejectedValue(MOCKED_ST_OUTPUT.response)

      await expect(submitTransactionPipeline.execute(MOCKED_ST_INPUT)).rejects.toThrow(
        'Transaction submission through Horizon failed!'
      )
      expect(HORIZON_HANDLER.server.submitTransaction).toHaveBeenCalledWith(MOCKED_TRANSACTION, {
        skipMemoRequiredCheck: true,
      })
    })

    it('should throw error if horizon resolved but was unsuccessful', async () => {
      HORIZON_HANDLER.server.submitTransaction = jest.fn().mockResolvedValue({
        ...MOCKED_ST_OUTPUT.response,
        successful: false,
      })

      await expect(submitTransactionPipeline.execute(MOCKED_ST_INPUT)).rejects.toThrow(
        'The transaction submitted through Horizon has failed!'
      )
      expect(HORIZON_HANDLER.server.submitTransaction).toHaveBeenCalledWith(MOCKED_TRANSACTION, {
        skipMemoRequiredCheck: true,
      })
    })
  })

  describe('Submit Transaction with RPCHandler', () => {
    const MOCKED_ST_INPUT_RPC: STInput = {
      transaction: MOCKED_TRANSACTION,
      networkHandler: RPC_HANDLER,
    }
    const MOCKED_ST_OUTPUT_RPC: STOutput = {
      response: {
        successful: true,
        hash: 'hash',
        ledger: 1,
        envelope_xdr: 'envelope_xdr',
        result_xdr: 'result_xdr',
        result_meta_xdr: 'result_meta_xdr',
        paging_token: 'paging_token',
        status: 'PENDING',
        latestLedger: 1,
        latestLedgerCloseTime: 1,
      } as SorobanRpc.Api.SendTransactionResponse,
    }

    beforeEach(() => {
      submitTransactionPipeline = new SubmitTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should submit transaction successfully', async () => {
      RPC_HANDLER.submitTransaction = jest.fn().mockResolvedValue(MOCKED_ST_OUTPUT_RPC.response)

      await expect(submitTransactionPipeline.execute(MOCKED_ST_INPUT_RPC)).resolves.toEqual(MOCKED_ST_OUTPUT_RPC)
      expect(RPC_HANDLER.submitTransaction).toHaveBeenCalledWith(MOCKED_TRANSACTION)
    })

    it('should throw error if something went wrong', async () => {
      RPC_HANDLER.submitTransaction = jest.fn().mockRejectedValue(MOCKED_ST_OUTPUT_RPC.response)

      await expect(submitTransactionPipeline.execute(MOCKED_ST_INPUT_RPC)).rejects.toThrow(
        'Transaction submission through Soroban RPC failed!'
      )
      expect(RPC_HANDLER.submitTransaction).toHaveBeenCalledWith(MOCKED_TRANSACTION)
    })
  })
})
