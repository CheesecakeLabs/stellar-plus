import { NetworkConfig } from 'stellar-plus/network'

import { ITestLedger } from '../types'

export interface ILocalStellarLedger extends ITestLedger {
  //   getNetworkPassphrase(): string
  //   getFriendBotUrl(): string
  //   getHorizonUrl(): string
  //   getSorobanRpcUrl(): string
  getNetworkConfig(): NetworkConfig
}

export interface ILocalStellarLedgerConstructorOptions {
  imageName?: string
  imageVersion?: string
  protocolVersion?: number // Defaults to latest protocol version
  limits?: // Defines the Soroban resource limits
  | 'default' //    leaves limits set extremely low which is stellar-core's default configuration
    | 'testnet' //    sets limits to match those used on testnet (the default quickstart configuration)
    | 'unlimited' //    sets limits to the maximum resources that can be configured
}
