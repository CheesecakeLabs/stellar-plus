import { TransactionBuilder } from 'stellar-base'
import {
  Transaction as ClassicTransaction,
  TransactionBuilder as ClassicTxBuild,
  Horizon as HorizonNamespace,
} from 'stellar-sdk'

import { DefaultAccountHandler } from '@account/account-handler/default/types'
import { TransactionSubmitter as TransactionSubmitter } from '@core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from '@core/types'
import { HorizonHandlerClient } from '@horizon/index'
import { HorizonHandler } from '@horizon/types'
import { FeeBumpTransaction, Network, Transaction } from '@stellar-plus/types'

export class ChannelAccountsTransactionSubmitter implements TransactionSubmitter {
  private feeBump?: FeeBumpHeader
  private freeChannels: DefaultAccountHandler[]
  private lockedChannels: DefaultAccountHandler[]
  private network: Network
  private horizonHandler: HorizonHandler

  constructor(network: Network, feeBump?: FeeBumpHeader) {
    this.network = network
    this.feeBump = feeBump
    this.horizonHandler = new HorizonHandlerClient(network)
    this.freeChannels = []
    this.lockedChannels = []
  }

  public registerChannels(channels: DefaultAccountHandler[]): void {
    this.freeChannels = [...this.freeChannels, ...channels]
  }

  private async allocateChannel(): Promise<DefaultAccountHandler> {
    if (this.freeChannels.length === 0) {
      return await this.noChannelPipeline()
    } else {
      const channel = this.freeChannels.pop() as DefaultAccountHandler
      this.lockedChannels.push(channel)

      return channel
    }
  }

  private releaseChannel(channelPublicKey: string): void {
    const channelIndex = this.lockedChannels.findIndex((channel) => channel.publicKey === channelPublicKey)
    if (channelIndex === -1) {
      throw new Error('Error releasing channel! Account not found!')
    }

    const channel = this.lockedChannels[channelIndex]
    this.lockedChannels.splice(channelIndex, 1)
    this.freeChannels.push(channel)
  }

  public async createEnvelope(txInvocation: TransactionInvocation): Promise<{
    envelope: TransactionBuilder
    updatedTxInvocation: TransactionInvocation
  }> {
    const { header } = txInvocation
    if (this.feeBump && !txInvocation.feeBump) {
      txInvocation.feeBump = this.feeBump
    }

    // console.log("Waiting for Channel!");
    const channel = await this.allocateChannel()

    const sourceAccount = await this.horizonHandler.loadAccount(channel.publicKey as string)

    const envelope = new TransactionBuilder(sourceAccount, {
      fee: header.fee,
      networkPassphrase: this.network.networkPassphrase,
    })

    const updatedSigners = [...txInvocation.signers, channel]
    const updatedTxInvocation = { ...txInvocation, signers: updatedSigners }
    return { envelope, updatedTxInvocation }
  }

  public async submit(envelope: Transaction): Promise<HorizonNamespace.SubmitTransactionResponse> {
    const innerEnvelope = (envelope as FeeBumpTransaction).innerTransaction
    const allocatedChannel = innerEnvelope.source

    // stellar-base vs stellar-sdk conversion
    const envelopeXdr = envelope.toXDR()
    const classicEnvelope = ClassicTxBuild.fromXDR(envelopeXdr, this.network.networkPassphrase) as ClassicTransaction

    try {
      const response = await this.horizonHandler.server.submitTransaction(classicEnvelope)

      this.releaseChannel(allocatedChannel)
      return response as HorizonNamespace.SubmitTransactionResponse
    } catch (error) {
      this.releaseChannel(allocatedChannel)
      // const resultObject = (error as any)?.response?.data?.extras?.result_codes
      // // console.log('RESULTOBJECT!!', resultObject)
      throw new Error('Failed to submit transaction!')
    }
  }

  public postProcessTransaction(
    response: HorizonNamespace.SubmitTransactionResponse
  ): HorizonNamespace.SubmitTransactionResponse {
    if (!response.successful) {
      // const restulObject = xdrNamespace.TransactionResult.fromXDR(response.result_xdr, 'base64')
      // const resultMetaObject = xdrNamespace.TransactionResultMeta.fromXDR(response.result_meta_xdr, 'base64')
      throw new Error('Transaction failed!')
    }

    return response
  }

  private noChannelPipeline(): Promise<DefaultAccountHandler> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.allocateChannel())
      }, 1000)
    })
  }

  public getChannels(): DefaultAccountHandler[] {
    return [...this.freeChannels, ...this.lockedChannels]
  }
}
