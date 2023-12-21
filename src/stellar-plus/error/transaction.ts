import { FeeBumpTransaction, Operation, Transaction } from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { EnvelopeHeader, FeeBumpHeader } from 'stellar-plus/core/types'

// ========== Trasnaction Invocation ============

//
// Signers must be public keys to avoid accidentally exposing a secret key
// when logging the error.
//
export type TransactionInvocationMeta =
  | string
  | {
      header?: {
        fee: string
        source: string
        timeout: number
      }
      signers?: string[]
      feebump?: FeeBumpHeaderMeta
    }

type FeeBumpHeaderMeta = {
  header?: {
    fee: string
    source: string
    timeout: number
  }
  signers?: string[]
}

export const extractTransactionInvocationMeta = (
  txInvocationArgs: {
    header?: EnvelopeHeader
    signers?: AccountHandler[]
    feeBump?: FeeBumpHeader
  },
  stringfy: boolean
): TransactionInvocationMeta => {
  const { header, signers, feeBump } = txInvocationArgs
  const meta: TransactionInvocationMeta = header ? { header: { ...header } } : {}

  if (signers) meta.signers = signers.map((signer) => signer.getPublicKey())
  if (feeBump) meta.feebump = extractTransactionInvocationMeta({ feeBump }, false) as FeeBumpHeaderMeta
  return stringfy ? JSON.stringify(meta) : meta
}

// ========== Trasnaction Data ============

export type TransactionData = FeeBumpTransactionData & {
  source: string
  fee: string
  sequence: string

  minTime?: string
  maxTime?: string

  operations?: OperationData[] | string
}

export type OperationData = {
  type: string
  source?: string
}

export type FeeBumpTransactionData = {
  feeSource: string
  feeBumpFee: string
}

export const extractTransactionData = (envelope: Transaction | FeeBumpTransaction): TransactionData => {
  const innerTransaction = envelope instanceof FeeBumpTransaction ? envelope.innerTransaction : envelope
  const feeBump = envelope instanceof FeeBumpTransaction ? envelope : undefined

  const operations = extractOperationsData(innerTransaction.operations, false)

  return {
    feeSource: feeBump?.feeSource,
    feeBumpFee: feeBump?.fee,
    source: innerTransaction.source,
    fee: innerTransaction.fee,
    sequence: innerTransaction.sequence,
    ...innerTransaction.timeBounds,
    operations,
  } as TransactionData
}

export const extractOperationsData = (operations: Operation[], stringfy: boolean): OperationData[] | string => {
  const operationData: OperationData[] = operations.map((operation) => {
    return {
      type: operation.type as string,
      source: operation.source as string,
    }
  })

  return stringfy ? JSON.stringify(operationData) : operationData
}
