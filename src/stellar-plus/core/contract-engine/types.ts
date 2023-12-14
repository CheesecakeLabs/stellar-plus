import { ContractSpec } from '@stellar/stellar-sdk'

import { RpcHandler } from 'stellar-plus/rpc/types'
import { Network } from 'stellar-plus/types'


export type ContractEngineConstructorArgs = {
  network: Network
  spec: ContractSpec
  contractId?: string
  rpcHandler?: RpcHandler
  wasm?: Buffer
  wasmHash?: string
}
