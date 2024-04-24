import { xdr } from '@stellar/stellar-sdk'

import { FeeBumpHeader, TransactionInvocation } from 'stellar-plus/types'

import { AccountHandler, SignatureSchema } from '../../account/account-handler/types'
import { EnvelopeHeader } from '../../core/types'

export const MockSubmitTransaction = {
  hash: 'hash',
  ledger: '1234',
  successful: true,
  envelope_xdr: 'envelope_xdr',
  result_xdr: 'result_xdr',
  result_meta_xdr: 'result_meta_xdr',
  paging_token: 'paging_token',
}

export const mockAccount = 'GBDMM7FQBVQPZFQPXVS3ZKK4UMELIWPBLG2BZQSWERD2KZR44WI6PTBQ'
export const mockSecretAccount = 'SCA6IAHZA53NVVOYVUQQI3YCNVUUBNJ4WMNQHFLKI4AKPXFGCU5NCXOV'

export function mockHeader(sourceKey = mockAccount): EnvelopeHeader {
  return {
    fee: '50',
    source: sourceKey,
    timeout: 500,
  }
}

export function mockSignatureSchema(
  threasholds?: SignatureSchema['threasholds'],
  signers?: SignatureSchema['signers']
): SignatureSchema {
  return {
    threasholds: threasholds || {
      low: 1,
      medium: 2,
      high: 3,
    },
    signers: signers || [
      {
        weight: 1,
        publicKey: mockAccount,
      },
    ],
  }
}

export function mockAccountHandler({
  accountKey = 'mockAccount',
  outputSignedTransaction,
  outputSignedAuthEntry,
  signatureSchema,
}: {
  accountKey?: string
  outputSignedTransaction?: string
  outputSignedAuthEntry?: xdr.SorobanAuthorizationEntry
  signatureSchema?: SignatureSchema
}): jest.Mocked<AccountHandler> {
  return {
    sign: jest.fn().mockReturnValue(outputSignedTransaction ?? 'success'),
    signSorobanAuthEntry: jest.fn().mockReturnValue(outputSignedAuthEntry ?? xdr.SorobanAuthorizationEntry),
    getPublicKey: jest.fn().mockReturnValue(accountKey),
    signatureSchema,
    getBalances: jest.fn().mockReturnValue([]),
    initializeWithFriendbot: jest.fn(),
  }
}

export function mockFeeBumpHeader(signerKey = mockAccount): FeeBumpHeader {
  return {
    signers: [mockAccountHandler({ accountKey: signerKey })],
    header: mockHeader(signerKey),
  }
}

export function mockTransactionInvocation(signerKey = mockAccount): TransactionInvocation {
  return {
    signers: [mockAccountHandler({ accountKey: signerKey })],
    header: mockHeader(signerKey),
    feeBump: mockFeeBumpHeader(signerKey),
  }
}

export const mockTransactionBuilder = {
  build: jest.fn().mockReturnValue('success'),
  addOperation: jest.fn().mockReturnValue({
    addOperation: jest.fn().mockReturnValue({
      addOperation: jest.fn().mockReturnValue(true),
      setTimeout: jest.fn().mockReturnValue({ build: jest.fn().mockReturnValue(true) }),
      build: jest.fn().mockReturnValue(true),
      payment: jest.fn().mockReturnValue(true),
    }),
    setTimeout: jest.fn().mockReturnValue({ build: jest.fn().mockReturnValue(true) }),
    build: jest.fn().mockReturnValue(true),
    payment: jest.fn().mockReturnValue(true),
  }),
  toXDR: jest.fn().mockReturnValue('success'),
}
