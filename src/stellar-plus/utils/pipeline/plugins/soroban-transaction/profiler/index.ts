import { TransactionResources } from 'stellar-plus/core/contract-engine/types'
import {
  SorobanTransactionPipelineInput,
  SorobanTransactionPipelineOutput,
  SorobanTransactionPipelineType,
} from 'stellar-plus/core/pipelines/soroban-transaction/b'
import { StellarPlusError } from 'stellar-plus/error'
import { BeltMetadata, BeltPluginType } from 'stellar-plus/utils/pipeline/conveyor-belts/types'
import { InnerPlugins, LogEntry } from 'stellar-plus/utils/pipeline/plugins/soroban-transaction/profiler/types'
import { Profiler } from 'stellar-plus/utils/profiler/soroban'

import { ExtractTransactionResourcesPlugin } from '../../simulate-transaction/extract-transaction-resources'

export class ProfilerPlugin
  implements
    BeltPluginType<SorobanTransactionPipelineInput, SorobanTransactionPipelineOutput, SorobanTransactionPipelineType>
{
  readonly type = SorobanTransactionPipelineType.id
  readonly name = 'ProfilerPlugin'

  private timers: { [key: string]: { start: number; end: number } } = {}
  private logs: { [key: string]: LogEntry } = {}
  public profiler: Profiler
  public plugins: InnerPlugins[] = []

  private costHandler: (
    methodName: string,
    costs: TransactionResources,
    elapsedTime: number,
    feeCharged: number
  ) => void

  constructor() {
    this.profiler = new Profiler()

    this.costHandler = this.profiler.getOptionsArgs().costHandler as (
      methodName: string,
      costs: TransactionResources,
      elapsedTime: number,
      feeCharged: number
    ) => void

    const extractTransactionResourcesPlugin = new ExtractTransactionResourcesPlugin(this.extractResources)
    this.plugins.push(extractTransactionResourcesPlugin)
  }

  public async preProcess(
    item: SorobanTransactionPipelineInput,
    meta: BeltMetadata
  ): Promise<SorobanTransactionPipelineInput> {
    this.startTimer(meta.itemId)
    this.createLogEntry(item, meta)

    return this.injectPlugins(item)
  }

  public async postProcess(
    item: SorobanTransactionPipelineOutput,
    meta: BeltMetadata
  ): Promise<SorobanTransactionPipelineOutput> {
    this.stopTimer(meta.itemId)
    this.setStatus(meta.itemId, 'success')
    this.log(meta)

    return item
  }

  public async processError(error: StellarPlusError, meta: BeltMetadata): Promise<StellarPlusError> {
    this.stopTimer(meta.itemId)
    this.setStatus(meta.itemId, 'error')
    this.log(meta)

    return error
  }

  private startTimer(id: string): void {
    this.timers[id] = {
      start: Date.now(),
      end: 0,
    }
  }

  private stopTimer(id: string): void {
    this.verifyLogEntry(id)
    this.timers[id] = {
      start: this.timers[id].start,
      end: Date.now(),
    }
  }

  private setStatus(id: string, status: 'running' | 'success' | 'error'): void {
    this.verifyLogEntry(id)
    this.logs[id].status = status
  }

  //todo: move error to StellarPlusError
  private verifyLogEntry(logId: string): void {
    if (!this.logs[logId]) {
      throw new Error(`log entry not found for item ${logId}`)
    }
  }

  private createLogEntry(item: SorobanTransactionPipelineInput, meta: BeltMetadata): void {
    const logEntry: LogEntry = {
      methodName: item.operations[0].body().switch().name,
      status: 'running',
      feeCharged: 0,
      elapsedTime: '',
      resources: {} as TransactionResources,
    }

    this.logs[meta.itemId] = logEntry
  }

  private log(meta: BeltMetadata): void {
    const logId = meta.itemId

    this.costHandler(
      this.logs[logId].methodName,
      this.logs[logId].resources,
      this.timers[logId].end - this.timers[logId].start,
      this.logs[logId].feeCharged
    )
  }

  private extractResources = (resources: TransactionResources, itemId: string): void => {
    this.verifyLogEntry(itemId)

    this.logs[itemId].resources = { ...resources }
  }

  private injectPlugins = (item: SorobanTransactionPipelineInput): SorobanTransactionPipelineInput => {
    const updatedItem = {
      ...item,
      options: item.options ? { ...item.options } : {},
    }
    updatedItem.options.innerPlugins = updatedItem.options.innerPlugins
      ? [...updatedItem.options.innerPlugins, ...this.plugins]
      : [...this.plugins]

    return updatedItem
  }
}
