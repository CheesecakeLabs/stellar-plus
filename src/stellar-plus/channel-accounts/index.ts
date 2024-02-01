import { xdr as ClassicXdrNamespace, Operation } from '@stellar/stellar-sdk'

import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { CHAError } from 'stellar-plus/channel-accounts/errors'
import { ClassicTransactionPipeline } from 'stellar-plus/core/pipelines/classic-transaction'
import { ClassicTransactionPipelineOptions } from 'stellar-plus/core/pipelines/classic-transaction/types'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { NetworkConfig } from 'stellar-plus/types'

export class ChannelAccounts {
  /**
   * @args {} The arguments for opening channels.
   * @param {number} numberOfChannels The number of channels to open.
   * @param {AccountHandler} sponsor The account that will sponsor the channels.
   * @param {NetworkConfig} networkConfig The network to use.
   * @param {TransactionInvocation} txInvocation: The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Opens the given number of channels and returns the list of channel accounts. The accounts will be funded with 0 balance and sponsored by the sponsor account.
   *
   * @returns {DefaultAccountHandler[]} Array of channel accounts.
   */
  public static async openChannels(args: {
    numberOfChannels: number
    sponsor: AccountHandler
    txInvocation: TransactionInvocation
    networkConfig: NetworkConfig
    transactionPipelineOptions?: ClassicTransactionPipelineOptions
  }): Promise<DefaultAccountHandler[]> {
    const { numberOfChannels, sponsor, transactionPipelineOptions, txInvocation, networkConfig } = args

    const classicTransactionPipeline = new ClassicTransactionPipeline(networkConfig, transactionPipelineOptions)

    if (numberOfChannels <= 0 || numberOfChannels > 15) {
      throw CHAError.invalidNumberOfChannelsToCreate(0, 15)
    }
    const channels: DefaultAccountHandler[] = []
    const operations: ClassicXdrNamespace.Operation[] = []

    for (let i = 0; i < numberOfChannels; i++) {
      const channel = new DefaultAccountHandler({ networkConfig: networkConfig })
      channels.push(channel)

      operations.push(
        Operation.beginSponsoringFutureReserves({
          sponsoredId: channel.getPublicKey(),
        }),
        Operation.createAccount({
          source: sponsor.getPublicKey(),
          destination: channel.getPublicKey(),
          startingBalance: '0',
        }),
        Operation.endSponsoringFutureReserves({
          source: channel.getPublicKey(),
        })
      )
    }

    const updatedTxInvocation = {
      ...txInvocation,
      signers: [...txInvocation.signers, ...channels, sponsor],
    }

    await classicTransactionPipeline.execute({
      txInvocation: updatedTxInvocation,
      operations,
    })

    return channels
  }

  /**
   * @args {} The arguments for closing channels.
   * @param {DefaultAccountHandler[]} channels The list of channels to close.
   * @param {DefaultAccountHandler} sponsor The account that was the sponsor for the channels.
   * @param {NetworkConfig} networkConfig The network to use.
   * @param {TransactionInvocation }xInvocation The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Closes the given channels and merges the balances into the sponsor account.
   *
   * @returns {void}
   */
  public static async closeChannels(args: {
    channels: DefaultAccountHandler[]
    sponsor: AccountHandler
    txInvocation: TransactionInvocation
    networkConfig: NetworkConfig
    transactionPipelineOptions?: ClassicTransactionPipelineOptions
  }): Promise<void> {
    const { channels, sponsor, networkConfig, txInvocation, transactionPipelineOptions } = args

    const classicTransactionPipeline = new ClassicTransactionPipeline(networkConfig, transactionPipelineOptions)

    const operations: ClassicXdrNamespace.Operation[] = []
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i]
      operations.push(
        Operation.accountMerge({
          source: channel.getPublicKey(),
          destination: sponsor.getPublicKey(),
        })
      )
    }

    const updatedTxInvocation = {
      ...txInvocation,
      signers: [...txInvocation.signers, ...channels, sponsor],
    }

    await classicTransactionPipeline.execute({
      txInvocation: updatedTxInvocation,
      operations,
    })
  }
}
