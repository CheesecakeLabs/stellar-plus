import { ChannelAccounts as ChannelAccountsHandler } from 'stellar-plus/channel-accounts/index'
import { CertificateOfDepositClient } from 'stellar-plus/soroban/contracts/certificate-of-deposit'
import * as Testing from 'stellar-plus/test/stellar-test-ledger'
import { pipelineUtils } from 'stellar-plus/utils/pipeline'
import { plugins } from 'stellar-plus/utils/pipeline/plugins'

export * as Account from 'stellar-plus/account/index'
export * as Asset from 'stellar-plus/asset/index'
export * as Network from 'stellar-plus/network'
export { HorizonHandlerClient as HorizonHandler } from 'stellar-plus/horizon/index'

export { Core } from 'stellar-plus/core/index'

export const ContractClients = {
  CertificateOfDeposit: CertificateOfDepositClient,
}

export const Utils = {
  ChannelAccountsHandler,
  Pipeline: pipelineUtils,
  Plugins: plugins,
}

export * as RPC from 'stellar-plus/rpc/index'

export * as Types from 'stellar-plus/types'

export { Testing }
