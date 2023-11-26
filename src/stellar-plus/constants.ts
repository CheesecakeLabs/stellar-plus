import { Network, NetworksList } from "./types";

let networksConfig: { [key: string]: Network } = {};
networksConfig.futurenet = {
  name: NetworksList.futurenet,
  networkPassphrase: "Test SDF Future Network ; October 2022",
  rpcUrl: "https://rpc-futurenet.stellar.org:443",
  friendbotUrl: "https://friendbot-futurenet.stellar.org",
  horizonUrl: "https://horizon-futurenet.stellar.org",
};

networksConfig.testnet = {
  name: NetworksList.testnet,
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org:443",
  friendbotUrl: "https://friendbot.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
};

export const testnet: Network = networksConfig.testnet;
export const futurenet: Network = networksConfig.futurenet;
