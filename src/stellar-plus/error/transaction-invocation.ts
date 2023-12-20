import { AccountHandler } from 'stellar-plus/account/account-handler/types'
import { EnvelopeHeader, FeeBumpHeader } from 'stellar-plus/core/types'

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
