import { CustomNet, FutureNet, MainNet, NetworksList, TestNet } from '.'

describe('Network', () => {
  describe('Default Network Configurations', () => {
    it('should return the TestNet configuration', () => {
      const testNet = TestNet()
      expect(testNet).toEqual({
        name: NetworksList.testnet,
        networkPassphrase: 'Test SDF Network ; September 2015',
        rpcUrl: 'https://soroban-testnet.stellar.org:443',
        friendbotUrl: 'https://friendbot.stellar.org',
        horizonUrl: 'https://horizon-testnet.stellar.org',
        allowHttp: false,
      })
    })
    it('should return the FutureNet configuration', () => {
      const futureNet = FutureNet()
      expect(futureNet).toEqual({
        name: NetworksList.futurenet,
        networkPassphrase: 'Test SDF Future Network ; October 2022',
        rpcUrl: 'https://rpc-futurenet.stellar.org:443',
        friendbotUrl: 'https://friendbot-futurenet.stellar.org',
        horizonUrl: 'https://horizon-futurenet.stellar.org',
        allowHttp: false,
      })
    })
    it('should return the MainNet configuration', () => {
      const mainNet = MainNet()
      expect(mainNet).toEqual({
        name: NetworksList.mainnet,
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
        rpcUrl: '',
        horizonUrl: 'https://horizon.stellar.org',
        allowHttp: false,
      })
    })
  })

  describe('Custom Network Configuration', () => {
    it('should return a custom network configuration', () => {
      const customNet = CustomNet({
        networkPassphrase: 'Custom Network',
        rpcUrl: 'https://rpc.custom.com',
        friendbotUrl: 'https://friendbot.custom.com',
        horizonUrl: 'https://horizon.custom.com',
        allowHttp: true,
      })

      expect(customNet).toEqual({
        name: NetworksList.custom,
        networkPassphrase: 'Custom Network',
        rpcUrl: 'https://rpc.custom.com',
        friendbotUrl: 'https://friendbot.custom.com',
        horizonUrl: 'https://horizon.custom.com',
        allowHttp: true,
      })
    })
  })
})
