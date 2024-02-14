import { Buffer } from 'buffer'

import { xdr } from '@stellar/stellar-sdk'

import { FeeBumpHeader, TransactionInvocation, TransactionXdr } from 'stellar-plus/types'

import { AccountHandler } from '../../account/account-handler/types'
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

export function mockAccountHandler(accountKey = mockAccount): AccountHandler {
  return {
    sign(_tx: any): TransactionXdr {
      return 'success'
    },
    signSorobanAuthEntry(
      _entry: any,
      _validUntilLedgerSeq: number,
      _networkPassphrase: string
    ): Promise<xdr.SorobanAuthorizationEntry> {
      return Promise.resolve(xdr.SorobanAuthorizationEntry.fromXDR(Buffer.from('success')))
    },

    getPublicKey(): string {
      return accountKey
    },
  }
}

export function mockFeeBumpHeader(signerKey = mockAccount): FeeBumpHeader {
  return {
    signers: [mockAccountHandler(signerKey)],
    header: mockHeader(signerKey),
  }
}

export function mockTransactionInvocation(signerKey = mockAccount): TransactionInvocation {
  return {
    signers: [mockAccountHandler(signerKey)],
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

// export const mockUnsignedClassicTransaction = new TransactionBuilder(new Account(mockAccount, '123'), { fee: '500' })
