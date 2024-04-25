import { Account, Asset, Claimant, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

import { SignatureRequirement, SignatureThreshold } from 'stellar-plus/core/types'
import { ConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { TestNet } from 'stellar-plus/network'
import { BeltMetadata } from 'stellar-plus/utils/pipeline/conveyor-belts/types'

import { CSRError } from './errors'
import { ClassicSignRequirementsPipelineInput, ClassicSignRequirementsPipelineType } from './types'

import { ClassicSignRequirementsPipeline } from './index'

const MOCKED_PK_A = 'GACF23GKVFTU77K6W6PWSVN7YBM63UHDULILIEXJO6FR4YKMJ7FW3DTI'
const MOCKED_PK_B = 'GB3MXH633VRECLZRUAR3QCLQJDMXNYNHKZCO6FJEWXVWSUEIS7NU376P'
const MOCKED_PK_C = 'GCPXAF4S5MBXA3DRNBA7XYP55S6F3UN2ZJRAS72BXEJMD7JVMGIGCKNA'

const MOCKED_ACCOUNT_A = new Account(MOCKED_PK_A, '100')

const TESTNET_PASSPHRASE = TestNet().networkPassphrase
const MOCKED_FEE = '100'
const MOCKED_BUMP_FEE = '101'

const MOCKED_TX_OPTIONS: TransactionBuilder.TransactionBuilderOptions = {
  fee: MOCKED_FEE,
  networkPassphrase: TESTNET_PASSPHRASE,
  timebounds: {
    minTime: 0,
    maxTime: 0,
  },
}

describe('ClassicSignRequirementsPipeline', () => {
  describe('Initialization', () => {
    it('should initialize pipeline', () => {
      const pipeline = new ClassicSignRequirementsPipeline()
      expect(pipeline).toBeDefined()
    })
  })
  describe('errors', () => {
    it('should throw error if internal process fails', async () => {
      const pipeline = new ClassicSignRequirementsPipeline()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(pipeline as any, 'bundleSignatureRequirements').mockImplementation(() => {
        throw new Error('mocked error')
      })
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const MOCKED_PROCESS_FAILED_ERROR = CSRError.processFailed(
        new Error('mocked error'),
        {
          item: transaction,
          meta: {
            itemId: 'mocked-id',
            beltId: 'mocked-belt-id',
            beltType: ClassicSignRequirementsPipelineType.id,
          },
        } as ConveyorBeltErrorMeta<ClassicSignRequirementsPipelineInput, BeltMetadata>,
        transaction
      )

      await expect(pipeline.execute(transaction)).rejects.toThrow(MOCKED_PROCESS_FAILED_ERROR.message)
      await expect(pipeline.execute(transaction)).rejects.toHaveProperty('code', MOCKED_PROCESS_FAILED_ERROR.code)
    })
  })

  describe('core requirement calculation', () => {
    it('should return signature requirements for an envelope source without operations', async () => {
      const expectedResult = [{ publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.medium }]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()

      await expect(pipeline.execute(transaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(transaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })

    it('should return signature requirements for a fee bump envelope', async () => {
      const expectedResult = [{ publicKey: MOCKED_PK_B, thresholdLevel: SignatureThreshold.low }]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS).build()
      const feeBumpTransaction = TransactionBuilder.buildFeeBumpTransaction(
        MOCKED_PK_B,
        MOCKED_BUMP_FEE,
        transaction,
        TESTNET_PASSPHRASE
      )

      await expect(pipeline.execute(feeBumpTransaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(feeBumpTransaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })

    it('should return signature requirements for an envelope source with one operation from same source', async () => {
      const expectedResult = [{ publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.medium }]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .addOperation(Operation.payment({ destination: MOCKED_PK_B, asset: Asset.native(), amount: '10' }))
        .build()

      await expect(pipeline.execute(transaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(transaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })

    it('should return signature requirements for an envelope source with one operation from different source', async () => {
      const expectedResult = [
        { publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.medium },
        { publicKey: MOCKED_PK_C, thresholdLevel: SignatureThreshold.medium },
      ]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .addOperation(
          Operation.payment({ destination: MOCKED_PK_B, asset: Asset.native(), amount: '10', source: MOCKED_PK_C })
        )
        .build()

      await expect(pipeline.execute(transaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(transaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })

    it('should return signature requirements for an envelope source with one operation of higher threshold for same source', async () => {
      const expectedResult = [{ publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.high }]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .addOperation(Operation.setOptions({ signer: { ed25519PublicKey: MOCKED_PK_B, weight: 2 } }))
        .build()

      await expect(pipeline.execute(transaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(transaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })

    it('should return signature requirements for an envelope source with one operation of higher threshold for different source', async () => {
      const expectedResult = [
        { publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.medium },
        { publicKey: MOCKED_PK_C, thresholdLevel: SignatureThreshold.high },
      ]
      const pipeline = new ClassicSignRequirementsPipeline()
      const transaction = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
        .addOperation(
          Operation.setOptions({ signer: { ed25519PublicKey: MOCKED_PK_B, weight: 2 }, source: MOCKED_PK_C })
        )
        .build()

      await expect(pipeline.execute(transaction)).resolves.toHaveLength(expectedResult.length)
      await expect(pipeline.execute(transaction)).resolves.toEqual(expect.arrayContaining(expectedResult))
    })
  })

  describe('operations threshold calculation', () => {
    let transactionBuilder: TransactionBuilder
    let testOperationRequirement: (operations: xdr.Operation[], expected: SignatureRequirement[]) => Promise<void>

    const pipeline = new ClassicSignRequirementsPipeline()
    const expectedLow = { publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.low }
    const expectedMedium = { publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.medium }
    const expectedHigh = { publicKey: MOCKED_PK_A, thresholdLevel: SignatureThreshold.high }

    beforeEach(() => {
      transactionBuilder = new TransactionBuilder(MOCKED_ACCOUNT_A, MOCKED_TX_OPTIONS)
      testOperationRequirement = (operations: xdr.Operation[], expected: SignatureRequirement[]): Promise<void> => {
        operations.forEach((op) => {
          transactionBuilder.addOperation(op)
        })
        const transaction = transactionBuilder.build()

        return pipeline.execute(transaction).then((result) => expect(result).toEqual(expected))
      }
    })

    it('should return threshold medium for createAccount operation', async () => {
      const operation = Operation.createAccount({ destination: MOCKED_PK_B, startingBalance: '10' })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for payment operation', async () => {
      const operation = Operation.payment({ destination: MOCKED_PK_B, asset: Asset.native(), amount: '10' })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for pathPaymentStrictSend operation', async () => {
      const operation = Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        destMin: '1',
        sendAmount: '10',
        destination: MOCKED_PK_B,
        destAsset: Asset.native(),
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for pathPaymentStrictReceive operation', async () => {
      const operation = Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: '10',
        destAmount: '1',
        destination: MOCKED_PK_B,
        destAsset: Asset.native(),
      })

      await testOperationRequirement([operation], [expectedMedium])
    })
    it('should return threshold medium for manageSellOffer operation', async () => {
      const operation = Operation.manageSellOffer({
        selling: Asset.native(),
        buying: new Asset('USD', MOCKED_PK_B),
        amount: '10',
        price: '1',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for manageBuyOffer operation', async () => {
      const operation = Operation.manageBuyOffer({
        selling: Asset.native(),
        buying: new Asset('USD', MOCKED_PK_B),
        buyAmount: '10',
        price: '1',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for createPassiveSellOffer operation', async () => {
      const operation = Operation.createPassiveSellOffer({
        selling: Asset.native(),
        buying: new Asset('USD', MOCKED_PK_B),
        amount: '10',
        price: '1',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })
    it('should return threshold high for setOptions operation with signer', async () => {
      const operation = Operation.setOptions({ signer: { ed25519PublicKey: MOCKED_PK_B, weight: 1 } })

      await testOperationRequirement([operation], [expectedHigh])
    })
    it('should return threshold high for setOptions operation with masterWeight', async () => {
      const operation = Operation.setOptions({ masterWeight: 1 })

      await testOperationRequirement([operation], [expectedHigh])
    })
    it('should return threshold high for setOptions operation with lowThreshold', async () => {
      const operation = Operation.setOptions({ lowThreshold: 1 })

      await testOperationRequirement([operation], [expectedHigh])
    })
    it('should return threshold high for setOptions operation with medThreshold', async () => {
      const operation = Operation.setOptions({ medThreshold: 1 })

      await testOperationRequirement([operation], [expectedHigh])
    })
    it('should return threshold high for setOptions operation with highThreshold', async () => {
      const operation = Operation.setOptions({ highThreshold: 1 })

      await testOperationRequirement([operation], [expectedHigh])
    })

    it('should return threshold medium for setOptions operation without any threshold', async () => {
      const emptySetOptionsOperation = Operation.setOptions({})
      const homeDomainSetOptionsOperation = Operation.setOptions({ homeDomain: 'example.com' })
      const setFlagsSetOptionsOperation = Operation.setOptions({ setFlags: 1 })
      const clearFlagsSetOptionsOperation = Operation.setOptions({ clearFlags: 1 })
      const inflationDestinationSetOptionsOperation = Operation.setOptions({ inflationDest: MOCKED_PK_B })

      await testOperationRequirement([emptySetOptionsOperation], [expectedMedium])
      await testOperationRequirement([homeDomainSetOptionsOperation], [expectedMedium])
      await testOperationRequirement([setFlagsSetOptionsOperation], [expectedMedium])
      await testOperationRequirement([clearFlagsSetOptionsOperation], [expectedMedium])
      await testOperationRequirement([inflationDestinationSetOptionsOperation], [expectedMedium])
    })

    it('should return threshold medium changeTrust operation', async () => {
      const operation = Operation.changeTrust({ asset: Asset.native() })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold low allowTrust operation', async () => {
      // If the source of the envelope was the same account as the one allowing the trust
      // the threshold would be medium due to the envelope requirement.
      // To properly test the low threshold requirement, we need to use a different account as the source.
      const operation = Operation.allowTrust({
        source: MOCKED_PK_C,
        trustor: MOCKED_PK_B,
        assetCode: Asset.native().code,
        authorize: true,
      })

      await testOperationRequirement([operation], [expectedMedium, { ...expectedLow, publicKey: MOCKED_PK_C }])
    })

    it('should return threshold high for accountMerge operation', async () => {
      const operation = Operation.accountMerge({ destination: MOCKED_PK_B })

      await testOperationRequirement([operation], [expectedHigh])
    })

    it('should return threshold medium for manageData operation', async () => {
      const operation = Operation.manageData({
        name: 'key',
        value: Buffer.from('value'),
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold low for bumpSequence operation', async () => {
      // If the source of the envelope was the same account as the one allowing the trust
      // the threshold would be medium due to the envelope requirement.
      // To properly test the low threshold requirement, we need to use a different account as the source.
      const operation = Operation.bumpSequence({ bumpTo: '1', source: MOCKED_PK_C })

      await testOperationRequirement([operation], [expectedMedium, { ...expectedLow, publicKey: MOCKED_PK_C }])
    })

    it('should return threshold medium for createClaimableBalance operation', async () => {
      const operation = Operation.createClaimableBalance({
        asset: Asset.native(),
        amount: '10',
        claimants: [new Claimant(MOCKED_PK_B)],
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for claimClaimableBalance operation', async () => {
      const operation = Operation.claimClaimableBalance({
        balanceId: '000000007a10d2aa862a610c88bdb1aacf3abf54160b09bec9adc62cfe4e0431e6b8b4c3',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for beginSponsoringFutureReserves operation', async () => {
      const operation = Operation.beginSponsoringFutureReserves({ sponsoredId: MOCKED_PK_B })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for endSponsoringFutureReserves operation', async () => {
      const operation = Operation.endSponsoringFutureReserves({ source: MOCKED_PK_A })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for revokeSponsorship operation variations', async () => {
      const revokeAccountOperation = Operation.revokeAccountSponsorship({ source: MOCKED_PK_C, account: MOCKED_PK_B })
      const revokeTrustlineOperation = Operation.revokeTrustlineSponsorship({
        source: MOCKED_PK_C,
        account: MOCKED_PK_B,
        asset: Asset.native(),
      })
      const revokeOfferOperation = Operation.revokeOfferSponsorship({
        source: MOCKED_PK_C,
        seller: MOCKED_PK_B,
        offerId: '1',
      })
      const revokeDataOperation = Operation.revokeDataSponsorship({
        source: MOCKED_PK_C,
        account: MOCKED_PK_B,
        name: 'key',
      })
      const revokeClaimableBalanceOperation = Operation.revokeClaimableBalanceSponsorship({
        source: MOCKED_PK_C,
        balanceId: '000000007a10d2aa862a610c88bdb1aacf3abf54160b09bec9adc62cfe4e0431e6b8b4c3',
      })
      const revokeLiquidityPoolOperation = Operation.revokeLiquidityPoolSponsorship({
        source: MOCKED_PK_C,
        liquidityPoolId: '076bbb9f17f8d47209515a345420d40ea1ebcd3cb6a370ea0d56fc12dbf084cb',
      })
      const revokeSignerOperation = Operation.revokeSignerSponsorship({
        source: MOCKED_PK_C,
        account: MOCKED_PK_B,
        signer: { ed25519PublicKey: MOCKED_PK_B },
      })

      await testOperationRequirement(
        [revokeAccountOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeTrustlineOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeOfferOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeDataOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeClaimableBalanceOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeLiquidityPoolOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
      await testOperationRequirement(
        [revokeSignerOperation],
        [expectedMedium, { ...expectedMedium, publicKey: MOCKED_PK_C }]
      )
    })

    it('should return threshold medium for clawback operation', async () => {
      const operation = Operation.clawback({ from: MOCKED_PK_B, amount: '10', asset: Asset.native() })

      await testOperationRequirement([operation], [expectedMedium])
    })
    it('should return threshold medium for clawbackClaimableBalance operation', async () => {
      const operation = Operation.clawbackClaimableBalance({
        balanceId: '000000007a10d2aa862a610c88bdb1aacf3abf54160b09bec9adc62cfe4e0431e6b8b4c3',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold low for setTrustLineFlags operation', async () => {
      // If the source of the envelope was the same account as the one allowing the trust
      // the threshold would be medium due to the envelope requirement.
      // To properly test the low threshold requirement, we need to use a different account as the source.
      const operation = Operation.setTrustLineFlags({
        asset: Asset.native(),
        source: MOCKED_PK_C,
        trustor: MOCKED_PK_B,
        flags: {
          authorized: true,
        },
      })

      await testOperationRequirement([operation], [expectedMedium, { ...expectedLow, publicKey: MOCKED_PK_C }])
    })

    it('should return threshold medium for liquidityPoolDeposit operation', async () => {
      const operation = Operation.liquidityPoolDeposit({
        maxAmountA: '10',
        maxAmountB: '10',
        minPrice: 1,
        maxPrice: 1,
        liquidityPoolId: '076bbb9f17f8d47209515a345420d40ea1ebcd3cb6a370ea0d56fc12dbf084cb',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })

    it('should return threshold medium for liquidityPoolWithdraw operation', async () => {
      const operation = Operation.liquidityPoolWithdraw({
        minAmountA: '10',
        minAmountB: '10',
        amount: '10',
        liquidityPoolId: '076bbb9f17f8d47209515a345420d40ea1ebcd3cb6a370ea0d56fc12dbf084cb',
      })

      await testOperationRequirement([operation], [expectedMedium])
    })
  })
})
