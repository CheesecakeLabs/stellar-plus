import { AccountHandler, AccountHandlerPayload } from '@account/account-handler/types'
import { Network } from '@stellar-plus/types'

export type FreighterAccountHandler = AccountHandler & {
  connect(onPublicKeyReceived: FreighterCallback): Promise<void>
  disconnect(): void
  loadPublicKey(onPublicKeyReceived: FreighterCallback, enforceConnection: boolean): Promise<void>
  isFreighterConnected(enforceConnection?: boolean, callback?: FreighterCallback): Promise<boolean>
  isFreighterInstalled(): Promise<boolean>
  isApplicationAuthorized(): Promise<boolean>
  isNetworkCorrect(): Promise<boolean>
}

export type FreighterAccHandlerPayload = AccountHandlerPayload & {
  network: Network
}

export type FreighterCallback = (pk: string) => void
