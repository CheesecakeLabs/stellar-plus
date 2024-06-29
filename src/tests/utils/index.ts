import { TransactionI } from '@stellar/stellar-sdk'
import { readFile } from 'fs/promises'
import { AccountHandler, DefaultAccountHandler } from 'stellar-plus/account'
import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/types'

export const loadWasmFile = async (wasmFilePath: string): Promise<Buffer> => {
  try {
    const buffer = await readFile(wasmFilePath)
    return buffer
  } catch (error) {
    console.error(`Error reading the WASM file: ${error}`)
    throw error
  }
}

export const simpleTxInvocation = (account: AccountHandler): TransactionInvocation => {
  return {
    header: {
      source: account.getPublicKey(),
      fee: '10000000',
      timeout: 0,
    },
    signers: [account],
  }
}

export const simpleTxInvocationToFeebump = (txInvocation: TransactionInvocation): FeeBumpHeader => {
  return {
    ...txInvocation,
    header: {
      ...txInvocation.header,
      fee: (Number(txInvocation.header.fee) * 10).toString(), // Ensure the feebump fee is larger
    },
  } as FeeBumpHeader
}
