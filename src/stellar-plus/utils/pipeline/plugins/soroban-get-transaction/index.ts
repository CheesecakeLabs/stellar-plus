import { ExtractContractIdPlugin } from './extract-contract-id'
import { ExtractFeeChargedPlugin } from './extract-fee-charged'
import { ExtractInvocationOutputPlugin } from './extract-invocation-output'
import { ExtractWasmHashPlugin } from './extract-wasm-hash'

export const sorobanGetTransactionPlugins = {
  extractContractId: ExtractContractIdPlugin,
  extractFeeCharged: ExtractFeeChargedPlugin,
  extractInvocationOutput: ExtractInvocationOutputPlugin,
  extractWasmHash: ExtractWasmHashPlugin,
}
