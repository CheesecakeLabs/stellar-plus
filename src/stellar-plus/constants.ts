import { NetworkConfig, NetworksList } from 'stellar-plus/types'

const networksConfig: { [key: string]: NetworkConfig } = {
  futurenet: {
    name: NetworksList.futurenet,
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    friendbotUrl: 'https://friendbot-futurenet.stellar.org',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
  },

  testnet: {
    name: NetworksList.testnet,
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org:443',
    friendbotUrl: 'https://friendbot.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  mainnet: {
    name: NetworksList.mainnet,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: '',
    horizonUrl: 'https://horizon.stellar.org',
  },
}
const testnet: NetworkConfig = networksConfig.testnet
const futurenet: NetworkConfig = networksConfig.futurenet
const mainnet: NetworkConfig = networksConfig.mainnet

export { testnet, futurenet, mainnet }
