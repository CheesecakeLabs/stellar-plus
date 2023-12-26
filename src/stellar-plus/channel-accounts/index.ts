import { xdr as ClassicXdrNamespace, Operation } from '@stellar/stellar-sdk'

import { DefaultAccountHandlerClient as DefaultAccountHandler } from 'stellar-plus/account/account-handler/default'
import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { TransactionProcessor } from 'stellar-plus/core/classic-transaction-processor'
import { TransactionInvocation } from 'stellar-plus/core/types'
import { Network } from 'stellar-plus/types'

import { CHAError } from './errors'

export class ChannelAccounts {
  /**
   * @args {} The arguments for opening channels.
   * @param {number} numberOfChannels The number of channels to open.
   * @param {AccountHandler} sponsor The account that will sponsor the channels.
   * @param {Network} network The network to use.
   * @param {TransactionInvocation} txInvocation: The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Opens the given number of channels and returns the list of channel accounts. The accounts will be funded with 0 balance and sponsored by the sponsor account.
   *
   * @returns {DefaultAccountHandler[]} Array of channel accounts.
   */
  public static async openChannels(args: {
    numberOfChannels: number
    sponsor: AccountHandler
    network: Network
    txInvocation: TransactionInvocation
  }): Promise<DefaultAccountHandler[]> {
    const { numberOfChannels, sponsor, network, txInvocation } = args

    const txProcessor = new TransactionProcessor({ network })

    if (numberOfChannels <= 0 || numberOfChannels > 15) {
      throw CHAError.invalidNumberOfChannelsToCreate(0, 15)
    }
    const channels: DefaultAccountHandler[] = []
    const operations: ClassicXdrNamespace.Operation[] = []

    for (let i = 0; i < numberOfChannels; i++) {
      const channel = new DefaultAccountHandler({ network })
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

    const verifiedSourceTxInvocation: TransactionInvocation = {
      ...(this.verifyTxInvocationWithSponsor(txInvocation, sponsor) as TransactionInvocation),
    }

    verifiedSourceTxInvocation.signers.push(...channels)

    const { builtTx, updatedTxInvocation } = await txProcessor.buildCustomTransaction(
      operations,
      verifiedSourceTxInvocation
    )

    // console.log("TxInvocation: ", updatedTxInvocation);
    await txProcessor.processTransaction(builtTx, updatedTxInvocation.signers)

    return channels
  }

  /**
   * @args {} The arguments for closing channels.
   * @param {DefaultAccountHandler[]} channels The list of channels to close.
   * @param {DefaultAccountHandler} sponsor The account that was the sponsor for the channels.
   * @param {Network} network The network to use.
   * @param {TransactionInvocation }xInvocation The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Closes the given channels and merges the balances into the sponsor account.
   *
   * @returns {void}
   */
  public static async closeChannels(args: {
    channels: DefaultAccountHandler[]
    sponsor: AccountHandler
    network: Network
    txInvocation: TransactionInvocation
  }): Promise<void> {
    const { channels, sponsor, network, txInvocation } = args
    const txProcessor = new TransactionProcessor({ network })
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
    const verifiedTxInvocation = this.verifyTxInvocationWithSponsor(txInvocation, sponsor)

    verifiedTxInvocation.signers = [...verifiedTxInvocation.signers, ...channels]

    const { builtTx, updatedTxInvocation } = await txProcessor.buildCustomTransaction(operations, verifiedTxInvocation)

    // console.log("TxInvocation: ", updatedTxInvocation);
    await txProcessor.processTransaction(builtTx, updatedTxInvocation.signers)
  }

  /**
   *
   *
   * @param {TransactionInvocation} txInvocation The transaction invocation settings to use when building the transaction envelope.
   * @param {DefaultAccountHandler} sponsor The account that will sponsor the channels.
   *
   * @description - Verifies that the transaction invocation has the sponsor as a signer if the source is not the sponsor.
   *
   * @returns {TransactionInvocation} The updated transaction invocation.
   */
  private static verifyTxInvocationWithSponsor(
    txInvocation: TransactionInvocation,
    sponsor: AccountHandler
  ): TransactionInvocation {
    return {
      ...txInvocation,
      signers:
        txInvocation.header.source === sponsor.getPublicKey()
          ? [...txInvocation.signers]
          : [...txInvocation.signers, sponsor],
    }
  }
}
