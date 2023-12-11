import { xdr as ClassicXdrNamespace, Operation } from 'stellar-base'

import { DefaultAccountHandlerClient as DefaultAccountHandler } from '@account/account-handler/default'
import { AccountHandler } from '@account/account-handler/types'
import { TransactionProcessor } from '@core/classic-transaction-processor'
import { TransactionInvocation } from '@core/types'
import { Network } from '@stellar-plus/types'

export class ChannelAccounts {
  public static async openChannels(args: {
    numberOfChannels: number
    sponsor: AccountHandler
    network: Network
    txInvocation: TransactionInvocation
  }): Promise<DefaultAccountHandler[]> {
    const { numberOfChannels, sponsor, network, txInvocation } = args

    const txProcessor = new TransactionProcessor(network)

    if (numberOfChannels <= 0 || numberOfChannels > 15) {
      throw new Error('Invalid number of channels! Must be between 1 and 15!')
    }
    const channels: DefaultAccountHandler[] = []
    const operations: ClassicXdrNamespace.Operation[] = []

    for (let i = 0; i < numberOfChannels; i++) {
      const channel = new DefaultAccountHandler({ network })
      channels.push(channel)

     operations.push(
        Operation.beginSponsoringFutureReserves({
          sponsoredId: channel.publicKey,
        }),
        Operation.createAccount({
          source: sponsor.getPublicKey(),
          destination: channel.publicKey,
          startingBalance: '0',
        }),
        Operation.endSponsoringFutureReserves({
          source: channel.publicKey,
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

  public static async closeChannels(
    channels: DefaultAccountHandler[],
    sponsor: DefaultAccountHandler,
    network: Network,
    txInvocation: TransactionInvocation
  ): Promise<void> {
    const txProcessor = new TransactionProcessor(network)
    const operations: ClassicXdrNamespace.Operation[] = []

    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i]

      operations.push(
        Operation.accountMerge({
          source: channel.publicKey,
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
