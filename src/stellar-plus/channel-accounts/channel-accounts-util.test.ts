/* eslint-disable import/order */

import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import MockTransactionProcessor from 'stellar-plus/core/classic-transaction-processor/mocks'

jest.mock('stellar-plus/core/classic-transaction-processor', () => {
  return { TransactionProcessor: MockTransactionProcessor as unknown as TransactionProcessor }
})

import { Operation } from '@stellar/stellar-sdk'

import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { ChannelAccounts } from 'stellar-plus/channel-accounts'
import { testnet } from 'stellar-plus/constants'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { Network } from 'stellar-plus/types'

describe('ChannelAccounts Util', () => {
  const mockNetwork: Network = testnet
  let mockSponsor: DefaultAccountHandler
  let mockTxInvocation: TransactionInvocation

  beforeEach(() => {
    mockSponsor = new DefaultAccountHandler({ network: mockNetwork })
    mockTxInvocation = {
      header: {
        source: mockSponsor.getPublicKey(),
        fee: '100',
        timeout: 30,
      },
      signers: [mockSponsor],
    }
  })

  // Tests for openChannels
  describe('openChannels', () => {
    it('should open the correct number of channels', async () => {
      // Given
      const numberOfChannels = 5

      jest.spyOn(Operation, 'beginSponsoringFutureReserves')
      jest.spyOn(Operation, 'createAccount')
      jest.spyOn(Operation, 'endSponsoringFutureReserves')

      // When
      const channels = await ChannelAccounts.openChannels({
        numberOfChannels,
        sponsor: mockSponsor,
        network: mockNetwork,
        txInvocation: mockTxInvocation,
      })

      // Then
      expect(channels).toHaveLength(numberOfChannels)
      expect(channels[0]).toBeInstanceOf(DefaultAccountHandler)

      expect(Operation.beginSponsoringFutureReserves).toHaveBeenCalledTimes(numberOfChannels)
      expect(Operation.createAccount).toHaveBeenCalledTimes(numberOfChannels)
      expect(Operation.endSponsoringFutureReserves).toHaveBeenCalledTimes(numberOfChannels)
    })
  })

  it('should throw error for invalid number of channels - under minimum', async () => {
    // Given
    const numberOfChannels = 0

    // When
    const openChannels = ChannelAccounts.openChannels({
      numberOfChannels,
      sponsor: mockSponsor,
      network: mockNetwork,
      txInvocation: mockTxInvocation,
    })

    // Then
    await expect(openChannels).rejects.toThrowError('Invalid number of channels to create')
  })

  it('should throw error for invalid number of channels - above maximum', async () => {
    // Given
    const numberOfChannels = 100

    // When
    const openChannels = ChannelAccounts.openChannels({
      numberOfChannels,
      sponsor: mockSponsor,
      network: mockNetwork,
      txInvocation: mockTxInvocation,
    })

    // Then
    await expect(openChannels).rejects.toThrowError('Invalid number of channels to create')
  })

  // Tests for closeChannels
  describe('closeChannels', () => {
    it('should close the channels and merge them into the sponsor', async () => {
      // Given
      const numberOfChannels = 5
      const channels = await ChannelAccounts.openChannels({
        numberOfChannels,
        sponsor: mockSponsor,
        network: mockNetwork,
        txInvocation: mockTxInvocation,
      })

      jest.spyOn(Operation, 'accountMerge')

      // When
      await ChannelAccounts.closeChannels({
        channels,
        sponsor: mockSponsor,
        network: mockNetwork,
        txInvocation: mockTxInvocation,
      })

      // Then
      expect(Operation.accountMerge).toHaveBeenCalledTimes(numberOfChannels)
    })
  })
})
