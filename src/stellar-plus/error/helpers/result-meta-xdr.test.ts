import Stellar from '@stellar/stellar-sdk'

import { extractSorobanResultXdrOpErrorCode } from './result-meta-xdr'

jest.mock('@stellar/stellar-sdk')

describe('extractSorobanResultXdrOpErrorCode', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    Stellar.xdr.TransactionResult = {
      fromXDR: jest.fn(),
    }
  })

  it('should extract op error code from XDR string', () => {
    const mockResultXdrObject = {
      result: () => ({
        results: () => [
          {
            tr: () => ({
              value: () => ({
                switch: () => ({
                  name: 'opErrorCode',
                }),
              }),
            }),
          },
        ],
      }),
    }

    Stellar.xdr.TransactionResult.fromXDR.mockReturnValueOnce(mockResultXdrObject)

    const result = extractSorobanResultXdrOpErrorCode('base64EncodedXDR')

    expect(result).toBe('opErrorCode')
    expect(Stellar.xdr.TransactionResult.fromXDR).toHaveBeenCalledWith('base64EncodedXDR', 'base64')
  })

  it('should handle XDR object with result method', () => {
    const mockResultXdrObject = {
      result: jest.fn(() => ({
        results: jest.fn(() => [
          {
            tr: jest.fn(() => ({
              value: jest.fn(() => ({
                switch: jest.fn(() => ({
                  name: 'opErrorCode',
                })),
              })),
            })),
          },
        ]),
      })),
    }

    const result = extractSorobanResultXdrOpErrorCode(<any>mockResultXdrObject)

    expect(result).toBe('opErrorCode')
    expect(mockResultXdrObject.result).toHaveBeenCalled()
  })

  it('should handle XDR object with result.switch method', () => {
    const mockResultXdrObject = {
      result: jest.fn(() => ({
        switch: jest.fn(() => ({
          name: 'opErrorCode',
        })),
      })),
    }

    const result = extractSorobanResultXdrOpErrorCode(<any>mockResultXdrObject)

    expect(result).toBe('opErrorCode')
    expect(mockResultXdrObject.result).toHaveBeenCalled()
  })

  it('should handle XDR object with missing results or switch methods', () => {
    const result = extractSorobanResultXdrOpErrorCode(<any>{})

    expect(result).toBe('not_found')
  })

  it('should handle decoding errors', () => {
    const mockResultXdrObject = {
      result: () => {
        throw new Error('Decoding error')
      },
    }

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    const result = extractSorobanResultXdrOpErrorCode(<any>mockResultXdrObject)

    expect(result).toBe('fail_in_decode_xdr')
    expect(consoleSpy).toHaveBeenCalledWith('Fail in decode xdr: %s, Error: %s', mockResultXdrObject, expect.any(Error))

    consoleSpy.mockRestore()
  })
})
