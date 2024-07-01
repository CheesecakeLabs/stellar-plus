import { mock } from 'node:test'
import { DebugPlugin } from '.'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'
import { rejects } from 'node:assert'

describe('Debug Plugin', () => {
  let debugPluginAll: DebugPlugin<any, any>
  let debugPluginInfo: DebugPlugin<any, any>
  let debugPluginError: DebugPlugin<any, any>

  it('initializes with a debug level', () => {
    debugPluginAll = new DebugPlugin('all')
    debugPluginInfo = new DebugPlugin('info')
    debugPluginError = new DebugPlugin('error')

    expect(debugPluginAll).toBeDefined()
    expect(debugPluginInfo).toBeDefined()
    expect(debugPluginError).toBeDefined()
  })

  describe('after initialization', () => {
    let mockedFn: jest.Mock
    beforeEach(() => {
      jest.clearAllMocks()
      mockedFn = jest.fn()
    })

    it('should log Info for conveyor belts', async () => {
      debugPluginInfo.preProcess = mockedFn
      debugPluginInfo.postProcess = mockedFn
      const belt = new ConveyorBelt<number, number, 'Sum'>({ type: 'Sum', plugins: [debugPluginInfo] })
      ;(belt as any).process = (num: number) => num + 1

      await belt.execute(1)

      expect(mockedFn).toHaveBeenCalledTimes(2)
    })

    it('should log All for conveyor belts', async () => {
      debugPluginAll.preProcess = mockedFn
      debugPluginAll.postProcess = mockedFn
      const belt = new ConveyorBelt<number, number, 'Sum'>({ type: 'Sum', plugins: [debugPluginAll] })
      ;(belt as any).process = (num: number) => num + 1

      await belt.execute(1)

      expect(mockedFn).toHaveBeenCalledTimes(2)
    })

    it('should log Error for conveyor belts when throwing', async () => {
      mockedFn.mockImplementationOnce((item) => item)
      debugPluginError.processError = mockedFn
      const belt = new ConveyorBelt<number, number, 'Sum'>({ type: 'Sum', plugins: [debugPluginError] })
      ;(belt as any).process = (num: number) => {
        throw Error('Mocked Error')
      }

      await expect(belt.execute(1)).rejects.toThrow()

      expect(mockedFn).toHaveBeenCalledTimes(1)
    })

    it('should not log Error for conveyor belts when not throwing', async () => {
      debugPluginError.processError = mockedFn
      const belt = new ConveyorBelt<number, number, 'Sum'>({ type: 'Sum', plugins: [debugPluginError] })
      ;(belt as any).process = (num: number) => num + 1

      await expect(belt.execute(1)).resolves.toBe(2)

      expect(mockedFn).not.toHaveBeenCalled()
    })
  })
})
