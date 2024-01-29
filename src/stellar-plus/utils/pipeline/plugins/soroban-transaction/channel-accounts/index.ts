import { AccountHandler } from 'stellar-plus/account'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { StellarPlusError } from 'stellar-plus/error'
import { FeeBumpHeader } from 'stellar-plus/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

export class ChannelAccountsPlugin
  implements
    BeltPluginType<SorobanTransactionPipelineInput, SorobanTransactionPipelineOutput, SorobanTransactionPipelineType>
{
  readonly type = SorobanTransactionPipelineType.id
  readonly name = 'ChannelAccountsPlugin'
  private freeChannels: AccountHandler[]

  private lockedChannels: { [key: string]: AccountHandler } = {}
  private feeBump?: FeeBumpHeader

  constructor(feeBump?: FeeBumpHeader) {
    // this.network = network
    this.feeBump = feeBump
    // this.horizonHandler = new HorizonHandlerClient(network)
    this.freeChannels = []
    this.lockedChannels = {}
  }

  //===========================================
  //         belt process modifiers
  //===========================================

  public async preProcess(
    item: SorobanTransactionPipelineInput,
    meta: BeltMetadata
  ): Promise<SorobanTransactionPipelineInput> {
    const allocatedChannel = await this.allocateChannel(meta.itemId)
    const updatedItem = this.injectChannel(item, allocatedChannel)

    return updatedItem
  }

  public async postProcess(
    item: SorobanTransactionPipelineOutput,
    meta: BeltMetadata
  ): Promise<SorobanTransactionPipelineOutput> {
    this.releaseChannel(meta.itemId)
    return item
  }

  public async processError(error: StellarPlusError, meta: BeltMetadata): Promise<StellarPlusError> {
    this.releaseChannel(meta.itemId)
    return error
  }

  //===========================================
  //         public methods
  //===========================================

  /**
   *
   * @description - Returns the list of channels registered to the pool.
   *
   * @returns {AccountHandler[]} The list of channels registered to the pool.
   */
  public getChannels(): AccountHandler[] {
    return [...this.freeChannels, ...Object.values(this.lockedChannels)]
  }

  /**
   *
   * @param {AccountHandler[]} channels - The channel accounts to register.
   *
   * @description - Registers the provided channel accounts to the pool.
   *
   * @see ChannelAccountsHandler for a helper class for managing channel accounts.
   */
  public registerChannels(channels: AccountHandler[]): void {
    this.freeChannels = [...this.freeChannels, ...channels]
  }

  //===========================================
  //         Internal methods
  //===========================================

  private async allocateChannel(id: string): Promise<AccountHandler> {
    if (this.freeChannels.length === 0) {
      return await this.noChannelPipeline(id)
    } else {
      const channel = this.freeChannels.pop() as AccountHandler

      this.lockedChannels[id] = channel

      return channel
    }
  }

  private releaseChannel(id: string): void {
    if (!this.lockedChannels[id]) {
      throw new Error(`locked channel not found for item ${id}`)
    }

    const channel = this.lockedChannels[id]
    delete this.lockedChannels[id]
    this.freeChannels.push(channel)
  }

  /**
   *
   * @description - Waits for a channel to be available and then allocates it. This step will wait for 1 second before trying again.
   * This function can be overriden to implement a custom waiting logic.
   *
   * @returns {Promise<AccountHandler>} The allocated channel account.
   */
  private noChannelPipeline(id: string): Promise<AccountHandler> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.allocateChannel(id))
      }, 1000)
    })
  }

  private injectChannel(
    item: SorobanTransactionPipelineInput,
    channel: AccountHandler
  ): SorobanTransactionPipelineInput {
    const { header } = item.txInvocation
    if (this.feeBump && !item.txInvocation.feeBump) {
      item.txInvocation.feeBump = this.feeBump as FeeBumpHeader
    }

    header.source = channel.getPublicKey()

    item.txInvocation.signers = [...item.txInvocation.signers, channel]

    return item
  }
}
