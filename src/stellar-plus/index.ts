import { ChannelAccounts as ChannelAccountsHandler } from 'stellar-plus/channel-accounts/index'
import { CertificateOfDepositClient } from 'stellar-plus/soroban/contracts/certificate-of-deposit'
import * as Testing from 'stellar-plus/test/stellar-test-ledger'
import { pipelineUtils } from 'stellar-plus/utils/pipeline'
import * as plugins from 'stellar-plus/utils/pipeline/plugins'
import * as Regex from 'stellar-plus/utils/regex'

export * as Account from 'stellar-plus/account/index'
export * as Asset from 'stellar-plus/asset/index'
export * as Markets from 'stellar-plus/markets/index'
export * as Network from 'stellar-plus/network'
export { HorizonHandlerClient as HorizonHandler } from 'stellar-plus/horizon/index'
export * from 'stellar-plus/utils/unit-conversion'

export { Core } from 'stellar-plus/core/index'

export const ContractClients = {
  CertificateOfDeposit: CertificateOfDepositClient,
}

export const Utils = {
  ChannelAccountsHandler,
  Pipeline: pipelineUtils,
  Plugins: plugins,
  Regex,
}

export * as RPC from 'stellar-plus/rpc/index'

export * as Types from 'stellar-plus/types'

export { Testing }
