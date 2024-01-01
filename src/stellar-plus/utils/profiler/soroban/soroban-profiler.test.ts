
import { TransactionResources } from 'stellar-plus/core/contract-engine/types'


import { Profiler } from '.'

const mockLogs = [
  {
    methodName: 'balance',
    costs: {
      cpuInstructions: 105693,
      ram: 36575,
      minResourceFee: 38739,
      ledgerReadBytes: 592,
      ledgerWriteBytes: 0,
      ledgerEntryReads: 2,
      ledgerEntryWrites: 0,
      eventSize: 0,
      returnValueSize: 20,
      transactionSize: 164,
    },
    elapsedTime: 2860,
  },
  {
    methodName: 'balance',
    costs: {
      cpuInstructions: 105693,
      ram: 36575,
      minResourceFee: 38739,
      ledgerReadBytes: 592,
      ledgerWriteBytes: 0,
      ledgerEntryReads: 2,
      ledgerEntryWrites: 0,
      eventSize: 0,
      returnValueSize: 20,
      transactionSize: 164,
    },
    elapsedTime: 1797,
  },
  {
    methodName: 'transfer',
    costs: {
      cpuInstructions: 142179,
      ram: 52145,
      minResourceFee: 48761,
      ledgerReadBytes: 708,
      ledgerWriteBytes: 232,
      ledgerEntryReads: 1,
      ledgerEntryWrites: 2,
      eventSize: 252,
      returnValueSize: 4,
      transactionSize: 248,
    },
    elapsedTime: 7761,
  },
  {
    methodName: 'transfer',
    costs: {
      cpuInstructions: 142550,
      ram: 52145,
      minResourceFee: 48765,
      ledgerReadBytes: 708,
      ledgerWriteBytes: 232,
      ledgerEntryReads: 1,
      ledgerEntryWrites: 2,
      eventSize: 252,
      returnValueSize: 4,
      transactionSize: 248,
    },
    elapsedTime: 12226,
  },
]

const mockCsvLogs = `Method Name,Elapsed Time,cpuInstructions,ram,minResourceFee,ledgerReadBytes,ledgerWriteBytes,ledgerEntryReads,ledgerEntryWrites,eventSize,returnValueSize,transactionSize
balance,2860,105693,36575,38739,592,,2,,,20,164
balance,1797,105693,36575,38739,592,,2,,,20,164
transfer,7761,142179,52145,48761,708,232,1,2,252,4,248
transfer,12226,142550,52145,48765,708,232,1,2,252,4,248`

const mockTableLogs = `Method Name | Elapsed Time | cpuInstructions | ram      | minResourceFee | ledgerReadBytes | ledgerWriteBytes | ledgerEntryReads | ledgerEntryWrites | eventSize | returnValueSize | transactionSize
------------+--------------+-----------------+----------+----------------+-----------------+------------------+------------------+-------------------+-----------+-----------------+----------------
balance | 2860         | 105693   | 36575          | 38739           | 592              |                  | 2                 |           |                 | 20              | 164
balance | 1797         | 105693   | 36575          | 38739           | 592              |                  | 2                 |           |                 | 20              | 164
transfer | 7761         | 142179   | 52145          | 48761           | 708              | 232              | 1                 | 2         | 252             | 4               | 248
transfer | 12226        | 142550   | 52145          | 48765           | 708              | 232              | 1                 | 2         | 252             | 4               | 248`

const populateLogEntries = (

  costHandler: (methodName: string, costs: TransactionResources, elapsedTime: number) => void

): void => {
  mockLogs.forEach((log) => {
    costHandler(log.methodName, log.costs, log.elapsedTime)
  })
}

describe('Profiler', () => {
  let profiler: Profiler

  beforeEach(() => {
    profiler = new Profiler()

    const args = profiler.getOptionsArgs()
    populateLogEntries(args.costHandler!)
  })

  it('should add a log entry when costHandler is invoked', () => {
    expect(profiler.getLog()).toHaveLength(4)
  })

  it('should return correct options arguments', () => {
    const options = profiler.getOptionsArgs()
    expect(options).toEqual({
      debug: true,

      costHandler: expect.any(Function) as (
        methodName: string,
        costs: TransactionResources,
        elapsedTime: number
      ) => void,

    })
  })

  it('should return the entire log without options', () => {
    const log = profiler.getLog()
    expect(log).toEqual(mockLogs)
  })

  it('should filter the log based on provided method filters', () => {
    const filteredLog = profiler.getLog({ filter: { methods: ['balance'] } })
    expect(filteredLog).toHaveLength(2)
  })

  it('should filter the log based on provided resource filters', () => {
    // Verify filtering by cpuInstructions using min value
    expect(profiler.getLog({ filter: { cpuInstructions: { min: 105694 } } })).toEqual([mockLogs[2], mockLogs[3]])

    // Verify filtering by cpuInstructions using min and max value
    // Also verify that the filter respects the include flag by including cpuInstructions and excluding ram

    // extract ram from costs in mockLogs[2] to mock filtered result
    const {
      costs: { ram: _ram, ...restOfCosts },
      ...restOfMockEntry
    } = mockLogs[2]
    const mockEntryTwoWithoutRam = {
      ...restOfMockEntry,
      costs: restOfCosts,
    }

    expect(
      profiler.getLog({
        filter: { cpuInstructions: { min: 105694, max: 142180, include: true }, ram: { include: false } },
      })
    ).toEqual([mockEntryTwoWithoutRam])
  })

  it('should clear the log through direct invocation', () => {
    profiler.clearLog()
    expect(profiler.getLog()).toHaveLength(0)
  })

  it('should clear the log through indirect invocation', () => {
    expect(profiler.getLog({ clear: true })).toHaveLength(4)
    expect(profiler.getLog()).toHaveLength(0)
  })

  it('should format the log as CSV', () => {
    const csvFormattedLog = profiler.getLog({ formatOutput: 'csv' })

    expect(csvFormattedLog).toEqual(mockCsvLogs)
  })

  it('should format the log as a text table', () => {
    const tableFormattedLog = profiler.getLog({ formatOutput: 'text-table' })

    expect(tableFormattedLog).toEqual(mockTableLogs)
  })

  it('should aggregate with method sum', () => {
    const aggregatedLog = profiler.getLog({ aggregate: { ledgerEntryReads: { method: 'sum' } } })

    expect(aggregatedLog).toEqual([{ methodName: 'aggregated', costs: { ledgerEntryReads: 6 } }])
  })

  it('should aggregate with method average', () => {
    const aggregatedLog = profiler.getLog({ aggregate: { ledgerEntryReads: { method: 'average' } } })

    expect(aggregatedLog).toEqual([{ methodName: 'aggregated', costs: { ledgerEntryReads: 1.5 } }])
  })

  it('should aggregate with method standardDeviation', () => {
    const aggregatedLog = profiler.getLog({ aggregate: { ledgerEntryReads: { method: 'standardDeviation' } } })

    expect(aggregatedLog).toEqual([{ methodName: 'aggregated', costs: { ledgerEntryReads: 0.5 } }])
  })
})
