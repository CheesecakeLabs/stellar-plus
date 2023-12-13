import { ClassicAssetHandler, ClassicAssetHandlerConstructorArgs } from '@asset/classic/types'
import { TokenInterface } from '@asset/types'
import { RpcHandler } from '@rpc/types'

export type SACHandler = TokenInterface & {
  classicHandler: ClassicAssetHandler
  getContractId(): string
}

export type SACConstructorArgs = ClassicAssetHandlerConstructorArgs & {
  rpcHandler?: RpcHandler
}
