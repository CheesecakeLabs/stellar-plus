import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk'

import { SignTransactionPipeline } from 'stellar-plus/core/pipelines/sign-transaction'
import {
  SignTransactionPipelineInput as STInput,
  SignTransactionPipelineOutput as STOutput,
} from 'stellar-plus/core/pipelines/sign-transaction/types'
import { TestNet } from 'stellar-plus/network'
import { mockAccountHandler, mockSignatureSchema } from 'stellar-plus/test/mocks/transaction-mock'

const MOCKED_KEYPAIRS = [
  Keypair.fromSecret('SAO45YQLDI4LIEPP2HXYVX72XBKEN4OBWYKR3P6AOS7EMOLJCJX5IF5A'),
  Keypair.fromSecret('SA2WW3DO6AVJQO5V4MU64DSDL34FRXVIQXIUMKS7JMAENCCI3ORMQVLA'),
  Keypair.fromSecret('SCHH7OAC6MC4NF3TG2JML56WJT5U7ZE355USOKGXZCQ2FCJZEX62OEKR'),
]
const TESTNET_PASSPHRASE = TestNet().networkPassphrase
const MOCKED_UNSGINED_TRANSACTION_XDR =
  'AAAAAgAAAAC8CrO4sEcs28O8U8KWvl4CpiGpCgRlbEwf2fp21SRe0gAAAGQADg/kAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const MOCKED_SIGNED_TRANSACTION_XDR =
  'AAAAAgAAAAC8CrO4sEcs28O8U8KWvl4CpiGpCgRlbEwf2fp21SRe0gAAAGQADg/kAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB1SRe0gAAAEBH30tw2MS4pbpLZ8RbEBTLxF2xalFGJRLfDhgcbildNTgujl6hbNxmw2qltop/SZfe34R4q9v+KVhp5pQ4DmkL'
const MOCKED_UNSIGNED_TRANSACTION = TransactionBuilder.fromXDR(MOCKED_UNSGINED_TRANSACTION_XDR, TESTNET_PASSPHRASE)
const MOCKED_SIGNED_TRANSACTION = TransactionBuilder.fromXDR(MOCKED_SIGNED_TRANSACTION_XDR, TESTNET_PASSPHRASE)
const MOCKED_SIGNATURE_REQUIREMENTS = [
  {
    publicKey: MOCKED_KEYPAIRS[0].publicKey(),
    thresholdLevel: 1,
  },
]
const MOCKED_SIGNER = mockAccountHandler({
  accountKey: MOCKED_KEYPAIRS[0].publicKey(),
  outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
})
const MOCKED_SIGNERS = [MOCKED_SIGNER]
const MOCKED_ST_INPUT: STInput = {
  transaction: MOCKED_UNSIGNED_TRANSACTION,
  signatureRequirements: MOCKED_SIGNATURE_REQUIREMENTS,
  signers: MOCKED_SIGNERS,
}
const MOCKED_ST_OUTPUT: STOutput = MOCKED_SIGNED_TRANSACTION

describe('SignTransactionPipeline', () => {
  let signTransactionPipeline: SignTransactionPipeline

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Sign Transaction', () => {
    beforeEach(() => {
      signTransactionPipeline = new SignTransactionPipeline()
      jest.clearAllMocks()
    })

    it('should sign transaction successfully', async () => {
      jest.spyOn(MOCKED_SIGNER, 'sign').mockResolvedValueOnce(MOCKED_SIGNED_TRANSACTION_XDR)

      await expect(signTransactionPipeline.execute(MOCKED_ST_INPUT)).resolves.toEqual(MOCKED_ST_OUTPUT)
      expect(MOCKED_SIGNER.sign).toHaveBeenCalledWith(MOCKED_UNSIGNED_TRANSACTION)
      expect(MOCKED_SIGNER.getPublicKey).toHaveBeenCalledTimes(1)
    })

    it('should sign transaction successfully with multiple signers', async () => {
      const mockedSigners = MOCKED_SIGNERS.concat(
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[1].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[2].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        })
      )
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: mockedSigners,
      }
      jest.spyOn(MOCKED_SIGNER, 'sign').mockResolvedValueOnce(MOCKED_SIGNED_TRANSACTION_XDR)

      await expect(signTransactionPipeline.execute(mockedInput)).resolves.toEqual(MOCKED_ST_OUTPUT)
      expect(MOCKED_SIGNER.sign).toHaveBeenCalledWith(MOCKED_UNSIGNED_TRANSACTION)
      expect(MOCKED_SIGNER.getPublicKey).toHaveBeenCalledTimes(1)
      expect(mockedSigners[1].sign).not.toHaveBeenCalledOnce()
      expect(mockedSigners[2].sign).not.toHaveBeenCalledOnce()
    })

    it('should sign transaction successfully with multiple signers and multiple requirements', async () => {
      const mockedSigners = MOCKED_SIGNERS.concat(
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[1].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[2].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        })
      )
      const mockedSignatureRequirements = MOCKED_SIGNATURE_REQUIREMENTS.concat(
        {
          publicKey: mockedSigners[1].getPublicKey(),
          thresholdLevel: 1,
        },
        {
          publicKey: mockedSigners[2].getPublicKey(),
          thresholdLevel: 1,
        }
      )
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signatureRequirements: mockedSignatureRequirements,
        signers: mockedSigners,
      }
      jest.spyOn(MOCKED_SIGNER, 'sign').mockResolvedValueOnce(MOCKED_SIGNED_TRANSACTION_XDR)

      await expect(signTransactionPipeline.execute(mockedInput)).resolves.toEqual(MOCKED_ST_OUTPUT)
      expect(mockedSigners[0].sign).toHaveBeenCalledWith(MOCKED_UNSIGNED_TRANSACTION)
      expect(mockedSigners[1].sign).toHaveBeenCalledWith(MOCKED_SIGNED_TRANSACTION)
      expect(mockedSigners[2].sign).toHaveBeenCalledWith(MOCKED_SIGNED_TRANSACTION)
    })

    it('should sign transaction successfully with same signer multiple times', async () => {
      const mockedSigners = MOCKED_SIGNERS.concat(
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        })
      )
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: mockedSigners,
      }
      jest.spyOn(MOCKED_SIGNER, 'sign').mockResolvedValueOnce(MOCKED_SIGNED_TRANSACTION_XDR)

      await expect(signTransactionPipeline.execute(mockedInput)).resolves.toEqual(MOCKED_ST_OUTPUT)
      expect(mockedSigners[0].sign).toHaveBeenCalledWith(MOCKED_UNSIGNED_TRANSACTION)
      expect(mockedSigners[1].sign).not.toHaveBeenCalled()
      expect(mockedSigners[2].sign).not.toHaveBeenCalled()
    })

    it('should throw error if try to sign with same signer and requirements multiple times', async () => {
      const mockedSigners = MOCKED_SIGNERS.concat(
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        }),
        mockAccountHandler({
          accountKey: MOCKED_KEYPAIRS[0].publicKey(),
          outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        })
      )
      const mockedSignatureRequirements = MOCKED_SIGNATURE_REQUIREMENTS.concat(
        {
          publicKey: mockedSigners[0].getPublicKey(),
          thresholdLevel: 1,
        },
        {
          publicKey: mockedSigners[0].getPublicKey(),
          thresholdLevel: 1,
        },
        {
          publicKey: mockedSigners[0].getPublicKey(),
          thresholdLevel: 1,
        }
      )
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: mockedSigners,
        signatureRequirements: mockedSignatureRequirements,
      }
      jest.spyOn(MOCKED_SIGNER, 'sign').mockRejectedValueOnce('Error signing transaction')

      await expect(signTransactionPipeline.execute(mockedInput)).rejects.toThrow('Failed to sign transaction!')
      expect(mockedSigners[0].sign).toHaveBeenCalledWith(MOCKED_UNSIGNED_TRANSACTION)
      expect(mockedSigners[1].sign).not.toHaveBeenCalled()
      expect(mockedSigners[2].sign).not.toHaveBeenCalled()
    })

    it('should throw error if no signature requirements received', async () => {
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signatureRequirements: [],
      }

      await expect(signTransactionPipeline.execute(mockedInput)).rejects.toThrow('No signature requirements provided!')
    })

    it('should throw error if no signers received', async () => {
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: [],
      }

      await expect(signTransactionPipeline.execute(mockedInput)).rejects.toThrow('No signers provided!')
    })

    it('should throw error if signature requirements does not contain signer public key', async () => {
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: [mockAccountHandler({ accountKey: 'anotherPublicKey' })],
      }

      await expect(signTransactionPipeline.execute(mockedInput)).rejects.toThrow('The signer was not found!')
    })

    it('should throw error if XDR convertion fails', async () => {
      jest.spyOn(MOCKED_SIGNER, 'sign').mockResolvedValueOnce('invalidXDR')

      await expect(signTransactionPipeline.execute(MOCKED_ST_INPUT)).rejects.toThrow('Failed to sign transaction!')
      expect(MOCKED_SIGNER.sign).toHaveBeenCalledTimes(1)
      expect(MOCKED_SIGNER.getPublicKey).toHaveBeenCalledTimes(2)
    })

    it('should throw error if transaction sign fails', async () => {
      ;(MOCKED_SIGNER.sign as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error signing transaction')
      })

      await expect(signTransactionPipeline.execute(MOCKED_ST_INPUT)).rejects.toThrow('Failed to sign transaction!')
      expect(MOCKED_SIGNER.sign).toHaveBeenCalledTimes(1)
      expect(MOCKED_SIGNER.getPublicKey).toHaveBeenCalledTimes(2)
    })

    it('should throw error if signer contains signatureSchema', async () => {
      const signatureSchema = mockSignatureSchema()
      const mockedSigner = mockAccountHandler({
        accountKey: MOCKED_KEYPAIRS[0].publicKey(),
        outputSignedTransaction: MOCKED_SIGNED_TRANSACTION_XDR,
        signatureSchema: signatureSchema,
      })
      const mockedInput = {
        ...MOCKED_ST_INPUT,
        signers: [mockedSigner],
      }

      await expect(signTransactionPipeline.execute(mockedInput)).rejects.toThrow(
        'Multisignature support not implemented yet'
      )
    })
  })
})
