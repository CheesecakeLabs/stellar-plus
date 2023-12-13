import { AccountHandler } from '@account/account-handler/types'
import { AssetTypes, TokenInterface } from '@asset/types'
import { TransactionSubmitter } from '@core/transaction-submitter/classic/types'
import { Network } from '@stellar-plus/types'

export type ClassicAsset = {
  code: string
  issuerPublicKey: string
  type: AssetTypes.native | AssetTypes.credit_alphanum4 | AssetTypes.credit_alphanum12
}

export type ClassicAssetHandler = ClassicAsset & TokenInterface

export type ClassicAssetHandlerConstructorArgs = {
  code: string
  issuerPublicKey: string
  network: Network
  issuerAccount?: AccountHandler
  transactionSubmitter?: TransactionSubmitter
}
