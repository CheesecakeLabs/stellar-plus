export type NetworkConfig = {
  name: NetworksList
  networkPassphrase: string
  rpcUrl?: string
  horizonUrl?: string
  friendbotUrl?: string
}

export enum NetworksList {
  testnet = 'testnet',
  futurenet = 'futurenet',
  mainnet = 'mainnet',
  custom = 'custom',
}

export const TestNet = (): NetworkConfig => {
  return {
    name: NetworksList.testnet,
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org:443',
    friendbotUrl: 'https://friendbot.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  }
}

export const FutureNet = (): NetworkConfig => {
  return {
    name: NetworksList.futurenet,
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    friendbotUrl: 'https://friendbot-futurenet.stellar.org',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
  }
}

export const MainNet = (): NetworkConfig => {
  return {
    name: NetworksList.mainnet,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: '',
    horizonUrl: 'https://horizon.stellar.org',
  }
}

export const CustomNet = (
  networkPassphrase: string,
  rpcUrl?: string,
  horizonUrl?: string,
  friendbotUrl?: string
): NetworkConfig => {
  return {
    name: NetworksList.custom,
    networkPassphrase,
    rpcUrl,
    horizonUrl,
    friendbotUrl,
  }
}
