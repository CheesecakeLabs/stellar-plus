import { AccountHandler } from 'stellar-plus/account'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-transaction/types'
import { StellarPlusError } from 'stellar-plus/error'
import { FeeBumpHeader } from 'stellar-plus/types'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'
import {
  ChannelAccountsPluginConstructorArgs,
  InputType,
} from 'stellar-plus/utils/pipeline/plugins/soroban-transaction/channel-accounts/types'

export class BaseChannelAccountsPlugin<Input extends InputType, Output, Type>
  implements BeltPluginType<Input, Output, Type>
{
  readonly type
  readonly name = 'ChannelAccountsPlugin'
  private freeChannels: AccountHandler[]

  private lockedChannels: { channel: AccountHandler; id: string }[] // Channels are allocated to items, and released when the item is processed.
  private feeBump?: FeeBumpHeader

  constructor(typeId: Type, channels?: AccountHandler[]) {
    this.type = typeId
    // this.feeBump = feeBump
    // this.horizonHandler = new HorizonHandlerClient(network)
    this.freeChannels = []
    this.lockedChannels = []
    if (channels) {
      this.registerChannels(channels)
    }
  }

  //===========================================
  //         belt process modifiers
  //===========================================

  public async preProcess(item: Input, meta: BeltMetadata): Promise<Input> {
    const allocatedChannel = await this.allocateChannel(meta.itemId)
    const updatedItem = this.injectChannel(item, allocatedChannel)

    return updatedItem
  }

  public async postProcess(item: Output, meta: BeltMetadata): Promise<Output> {
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
    const lockedChannels = this.lockedChannels.map((c) => c.channel)

    return [...this.freeChannels, ...lockedChannels]
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

      this.lockedChannels.push({
        id,
        channel,
      })

      return channel
    }
  }

  private releaseChannel(id: string): void {
    const channel = this.lockedChannels.find((c) => c.id === id)?.channel
    if (!channel) {
      throw new Error(`locked channel not found for item ${id}`)
    }

    this.lockedChannels = this.lockedChannels.filter((c) => c.id !== id)
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

  private injectChannel(item: Input, channel: AccountHandler): Input {
    const { header } = item.txInvocation

    const updatedTxInvocation = {
      ...item.txInvocation,
      ...{ header: { ...header, source: channel.getPublicKey() } },
      signers: [...item.txInvocation.signers, channel],
      feeBump: this.feeBump && !item.txInvocation.feeBump ? (this.feeBump as FeeBumpHeader) : item.txInvocation.feeBump,
    }

    const updatedItem = {
      ...item,
      ...{ txInvocation: updatedTxInvocation },
    }
    return updatedItem
  }
}

export class SorobanChannelAccountsPlugin extends BaseChannelAccountsPlugin<
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType
> {
  constructor(args: ChannelAccountsPluginConstructorArgs) {
    super(SorobanTransactionPipelineType.id, args.channels)
  }
}
