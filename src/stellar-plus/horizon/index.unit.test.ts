import { DHHError } from 'stellar-plus/horizon/errors'
import { HorizonHandlerClient } from 'stellar-plus/horizon/index'
import { CustomNet, TestNet } from 'stellar-plus/network'

// jest.mock('@stellar/stellar-sdk', () => ({
//   Horizon: jest.fn(),
// }))

// const MOCKED_HORIZON = Horizon as unknown as jest.Mock

const NETWORK_CONFIG = TestNet()

describe('Default Horizon Handler', () => {
  describe('Constructor', () => {
    it('should throw an error if the network c]onfiguration is missing the Horizon URL', () => {
      const netWorkConfigWithoutHorizonUrl = CustomNet({ ...NETWORK_CONFIG, horizonUrl: undefined })

      expect(() => new HorizonHandlerClient(netWorkConfigWithoutHorizonUrl)).toThrow(DHHError.missingHorizonUrl())
    })
    it('should create a new Horizon server instance', () => {
      const horizonHandler = new HorizonHandlerClient(NETWORK_CONFIG)

      expect(horizonHandler).toBeDefined()
      expect(horizonHandler.server).toBeDefined()
    })

    it('should create a new Horizon server instance with allowHttp option when enabled in the network', () => {
      const networkConfigWithHttp = CustomNet({ ...NETWORK_CONFIG, allowHttp: true })
      const horizonHandler = new HorizonHandlerClient(networkConfigWithHttp)

      expect(horizonHandler).toBeDefined()
      expect(horizonHandler.server).toBeDefined()
    })
  })

  describe('loadAccount', () => {
    it('should throw an error if the account fails to load', async () => {
      const horizonHandler = new HorizonHandlerClient(NETWORK_CONFIG)
      horizonHandler.server.loadAccount = jest.fn().mockRejectedValue(new Error('Failed to load account'))

      await expect(horizonHandler.loadAccount('mock_account')).rejects.toThrow(DHHError.failedToLoadAccount())
    })

    it('should return the account response from horizon', async () => {
      const horizonHandler = new HorizonHandlerClient(NETWORK_CONFIG)
      horizonHandler.server.loadAccount = jest.fn().mockResolvedValue({ id: 'mock_account' })

      const response = await horizonHandler.loadAccount('mock_account')

      expect(response).toEqual({ id: 'mock_account' })
    })
  })
})
