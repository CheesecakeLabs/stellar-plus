import { ClassicAssetHandler, ClassicAssetHandlerConstructorArgs } from 'stellar-plus/asset/classic/types'
import { TokenInterface } from 'stellar-plus/asset/types'
import { RpcHandler } from 'stellar-plus/rpc/types'

export type SACHandler = TokenInterface & {
  classicHandler: ClassicAssetHandler
  getContractId(): string
}

export type SACConstructorArgs = ClassicAssetHandlerConstructorArgs & {
  rpcHandler?: RpcHandler
}
