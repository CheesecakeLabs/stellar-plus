import { FeeBumpTransaction, Horizon as HorizonNamespace, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

import { DefaultAccountHandler } from 'stellar-plus/account/account-handler/default/types'
import { TransactionSubmitter as TransactionSubmitter } from 'stellar-plus/core/transaction-submitter/classic/types'
import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/core/types'
import { HorizonHandlerClient } from 'stellar-plus/horizon/index'
import { HorizonHandler } from 'stellar-plus/horizon/types'
import { Network } from 'stellar-plus/types'

export class ChannelAccountsTransactionSubmitter implements TransactionSubmitter {
  private feeBump?: FeeBumpHeader
  private freeChannels: DefaultAccountHandler[]
  private lockedChannels: DefaultAccountHandler[]
  private network: Network
  private horizonHandler: HorizonHandler

  /**
   *
   * @param {Network} network - The network to use.
   * @param {FeeBumpHeader=} feeBump - The fee bump header to use for wrapping transactions. If not provided during the invocations, this default fee bump header will be used.
   *
   * @description - The channel accounts transaction submitter is used for submitting transactions using a pool of channel accounts.
   *
   * @see https://developers.stellar.org/docs/encyclopedia/channel-accounts for more information.
   * @see ChannelAccountsHandler for a helper class for managing channel accounts.
   */
  constructor(network: Network, feeBump?: FeeBumpHeader) {
    this.network = network
    this.feeBump = feeBump
    this.horizonHandler = new HorizonHandlerClient(network)
    this.freeChannels = []
    this.lockedChannels = []
  }

  /**
   *
   * @param {DefaultAccountHandler[]} channels - The channel accounts to register.
   *
   * @description - Registers the provided channel accounts to the pool.
   *
   * @see ChannelAccountsHandler for a helper class for managing channel accounts.
   */
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

  /**
   *
   * @param {TransactionInvocation} txInvocation - The transaction invocation settings to use when building the transaction envelope.
   *
   * @description - Creates a transaction envelope using the provided transaction invocation settings. This step will allocate a channel account to use for the transaction.
   *
   * @returns {{ envelope: TransactionBuilder, updatedTxInvocation: TransactionInvocation }} The transaction envelope and the updated transaction invocation.
   *
   * @see https://developers.stellar.org/docs/encyclopedia/channel-accounts for more information.
   */
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

  //submit(envelope: Transaction, signers: AccountHandler[], feeBump?: FeeBumpHeader): Promise<HorizonNamespace.SubmitTransactionResponse>

  /**
   *
   * @param {Transaction} envelope - The transaction to submit.
   *
   * @description - Submits the provided transaction to the network. This step will release the channel account used for the transaction.
   *
   * @returns {Promise<HorizonNamespace.SubmitTransactionResponse>} The response from the Horizon server.
   */
  public async submit(
    envelope: Transaction | FeeBumpTransaction
  ): Promise<HorizonNamespace.HorizonApi.SubmitTransactionResponse> {
    const innerEnvelope = (envelope as FeeBumpTransaction).innerTransaction
    const allocatedChannel = innerEnvelope.source

    // stellar-base vs stellar-sdk conversion
    const envelopeXdr = envelope.toXDR()
    const classicEnvelope = TransactionBuilder.fromXDR(envelopeXdr, this.network.networkPassphrase) as Transaction

    try {
      const response = await this.horizonHandler.server.submitTransaction(classicEnvelope)

      this.releaseChannel(allocatedChannel)
      return response as HorizonNamespace.HorizonApi.SubmitTransactionResponse
    } catch (error) {
      this.releaseChannel(allocatedChannel)
      // const resultObject = (error as any)?.response?.data?.extras?.result_codes
      // // console.log('RESULTOBJECT!!', resultObject)
      throw new Error('Failed to submit transaction!')
    }
  }

  /**
   *
   * @param { HorizonNamespace.SubmitTransactionResponse } response - The response from the Horizon server.
   *
   * @returns { HorizonNamespace.SubmitTransactionResponse } The response from the Horizon server.
   *
   * @description - Post processes the response from the Horizon server. This step will throw an error if the transaction failed.
   * This function can be overriden to implement a custom post processing logic.
   */
  public postProcessTransaction(
    response: HorizonNamespace.HorizonApi.SubmitTransactionResponse
  ): HorizonNamespace.HorizonApi.SubmitTransactionResponse {
    if (!response.successful) {
      // const restulObject = xdrNamespace.TransactionResult.fromXDR(response.result_xdr, 'base64')
      // const resultMetaObject = xdrNamespace.TransactionResultMeta.fromXDR(response.result_meta_xdr, 'base64')
      throw new Error('Transaction failed!')
    }

    return response
  }

  /**
   *
   * @description - Waits for a channel to be available and then allocates it. This step will wait for 1 second before trying again.
   * This function can be overriden to implement a custom waiting logic.
   *
   * @returns {Promise<DefaultAccountHandler>} The allocated channel account.
   */
  private noChannelPipeline(): Promise<DefaultAccountHandler> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.allocateChannel())
      }, 1000)
    })
  }

  /**
   *
   * @description - Returns the list of channels registered to the pool.
   *
   * @returns {DefaultAccountHandler[]} The list of channels registered to the pool.
   */
  public getChannels(): DefaultAccountHandler[] {
    return [...this.freeChannels, ...this.lockedChannels]
  }
}
