import { Options, TransactionResources } from 'stellar-plus/core/contract-engine/types'
import {
  AggregateType,
  AggregationMethod,
  FilterResource,
  Filters,
  GetLogOptions,
  LogEntry,
  ResourcesList,
} from 'stellar-plus/utils/profiler/soroban/types'

export class Profiler {
  private log: LogEntry[] = []

  private costHandler = (
    methodName: string,
    costs: TransactionResources,
    elapsedTime: number,
    feeCharged: number
  ): void => {
    const entry: LogEntry = {
      methodName,
      costs,
      feeCharged,
      elapsedTime,
    }
    this.log.push(entry)
  }

  public getOptionsArgs = (): Options => {
    return {
      debug: true,
      costHandler: this.costHandler,
    }
  }

  public getLog = (options?: GetLogOptions): LogEntry[] | string => {
    const filteredLog = options?.filter ? this.filterLog(this.log, options.filter) : this.log

    const aggregatedLog = options?.aggregate ? this.aggregateLog(filteredLog, options.aggregate) : filteredLog

    if (options?.clear) {
      this.clearLog()
    }

    if (options?.formatOutput && options.formatOutput === 'csv') {
      return this.formatAsCsv(aggregatedLog)
    }
    if (options?.formatOutput && options.formatOutput === 'text-table') {
      return this.formatAsTable(aggregatedLog)
    }

    return aggregatedLog
  }

  public clearLog = (): void => {
    this.log = []
  }

  // apply filters to log and return filtered log
  // filter by methods, resources and values
  private filterLog = (log: LogEntry[], filters: Filters): LogEntry[] => {
    const { methods, ...resources } = filters

    const filteredLogByMethods = methods ? this.filterLogByMethods(log, methods) : log

    const filteredLogByResources = resources
      ? this.filterLogByResources(filteredLogByMethods, resources)
      : filteredLogByMethods

    return filteredLogByResources
  }

  private filterLogByMethods = (log: LogEntry[], methods: string[]): LogEntry[] => {
    return log.filter((entry) => methods.includes(entry.methodName))
  }

  private filterLogByResources = (log: LogEntry[], resources: ResourcesList<FilterResource>): LogEntry[] => {
    return log.reduce((acc, logEntry) => {
      let shouldIncludeLogEntry = true
      const filteredCosts = Object.keys(logEntry.costs).reduce((costsAccumulator, resourceKey) => {
        const resourceFilter = resources[resourceKey as keyof typeof resources]

        const resourceValue = logEntry.costs[resourceKey as keyof TransactionResources] as number | undefined

        if (!resourceFilter) {
          // Rule 1 and 5: Include the resource as is
          costsAccumulator[resourceKey as keyof TransactionResources] = resourceValue
        } else if (resourceFilter.include === false) {
          // Rule 2: Exclude this resource from costs, but keep the log entry
          // No action needed here, as the resource is simply not added to costsAccumulator
        } else {
          // Rule 3 and 4: Check min/max only if include is true or undefined
          const withinMinRange = resourceFilter.min === undefined || (resourceValue as number) >= resourceFilter.min
          const withinMaxRange = resourceFilter.max === undefined || (resourceValue as number) <= resourceFilter.max

          if (typeof resourceValue === 'number' && withinMinRange && withinMaxRange) {
            costsAccumulator[resourceKey as keyof TransactionResources] = resourceValue
          } else {
            shouldIncludeLogEntry = false // Exclude the entire log entry
          }
        }

        return costsAccumulator
      }, {} as TransactionResources)

      if (shouldIncludeLogEntry) {
        acc.push({ ...logEntry, costs: filteredCosts })
      }

      return acc
    }, [] as LogEntry[])
  }

  private aggregateLog = (log: LogEntry[], aggregateOptions: AggregateType): LogEntry[] => {
    const costs: [keyof TransactionResources, number][] = []

    const resources = Object.keys(log[0]?.costs || {})

    resources.forEach((resourceKey) => {
      const specificMethod = aggregateOptions[resourceKey as keyof AggregateType]
      const defaultMethod = aggregateOptions.all
      const aggregationMethod = specificMethod || defaultMethod

      if (aggregationMethod) {
        const aggregatedValue = this.performAggregation(log, resourceKey, aggregationMethod)

        costs.push([resourceKey as keyof TransactionResources, aggregatedValue])
      }
    })

    let elapsedTime: number | undefined
    if (aggregateOptions.elapsedTime) {
      elapsedTime = this.performAggregation(log, 'elapsedTime', aggregateOptions.elapsedTime)
    }

    let feeCharged: number | undefined
    if (aggregateOptions.feeCharged) {
      feeCharged = this.performAggregation(log, 'feeCharged', aggregateOptions.feeCharged)
    }

    return [
      {
        methodName: 'aggregated',

        costs: Object.fromEntries(costs) as TransactionResources,

        ...{ elapsedTime, feeCharged },
      },
    ] as LogEntry[]
  }

  private performAggregation = (
    logEntries: LogEntry[],
    resourceKey: string,
    aggregationMethod: AggregationMethod
  ): number => {
    const values = logEntries.map((entry) => {
      const value =
        resourceKey === 'elapsedTime'
          ? entry.elapsedTime
          : resourceKey === 'feeCharged'
            ? entry.feeCharged
            : (entry.costs[resourceKey as keyof TransactionResources] as number | undefined)

      return typeof value === 'number' ? value : 0
    })

    switch (aggregationMethod.method) {
      case 'sum':
        return values.reduce((acc, value) => acc + value, 0)
      case 'average': {
        const total = values.reduce((acc, value) => acc + value, 0)
        return total / values.length
      }
      case 'standardDeviation': {
        const mean = values.reduce((acc, value) => acc + value, 0) / values.length
        const squaredDifferences = values.map((value) => (value - mean) ** 2)
        const variance = squaredDifferences.reduce((acc, value) => acc + value, 0) / values.length
        const standardDeviation = Math.sqrt(variance)
        return standardDeviation
      }
      // Implement other aggregation methods like median, etc.
      default:
        throw new Error(`Unknown aggregation method: ${aggregationMethod.method}`)
    }
  }

  private formatAsTable(log: LogEntry[]): string {
    if (log.length === 0) {
      return '' // Return an empty string if the log is empty
    }

    // Determine the column widths
    const columnWidths: number[] = []
    const headers = ['Method Name', 'Elapsed Time', 'Fee Charged', ...Object.keys(log[0]?.costs || {})]

    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...log.map((entry) =>
          Math.max(
            entry.methodName.length,
            (entry.elapsedTime?.toString() as string).length,
            (entry.feeCharged.toString() as string).length,

            (entry.costs[header as keyof TransactionResources]?.toString() || '').length
          )
        )
      )
      columnWidths[index] = maxLength
    })

    // Generate the table header
    const headerRow = headers.map((header, index) => header.padEnd(columnWidths[index])).join(' | ')

    // Generate the separator row
    const separatorRow = columnWidths.map((width) => '-'.repeat(width)).join('-+-')

    // Generate the data rows
    const dataRows = log
      .map((entry) => {
        const row = [
          entry.methodName,
          entry.elapsedTime?.toString().padEnd(columnWidths[1]),
          entry.feeCharged.toString().padEnd(columnWidths[2]),
          ...headers.slice(3).map((header) =>
            ((entry.costs[header as keyof TransactionResources] as number | undefined) || '')

              .toString()
              .padEnd(columnWidths[headers.indexOf(header) + 3])
          ),
        ]
        return row.join(' | ')
      })
      .join('\n')

    // Combine the header, separator, and data rows
    const formattedTable = [headerRow, separatorRow, dataRows].join('\n')

    return formattedTable
  }

  private formatAsCsv(log: LogEntry[]): string {
    if (log.length === 0) {
      return '' // Return an empty string if the log is empty
    }

    // Generate the header row
    const headers = ['Method Name', 'Elapsed Time', 'Fee Charged', ...Object.keys(log[0]?.costs || {})]
    const headerRow = headers.join(',')

    // Generate the data rows
    const dataRows = log
      .map((entry) => {
        const row = [
          entry.methodName,
          entry.elapsedTime,
          entry.feeCharged,

          ...headers
            .slice(3)
            .map((header) =>
              ((entry.costs[header as keyof TransactionResources] as number | undefined) || '').toString()
            ),
        ]
        return row.join(',')
      })
      .join('\n')

    // Combine the header and data rows
    const formattedCsv = [headerRow, dataRows].join('\n')

    return formattedCsv
  }
}
