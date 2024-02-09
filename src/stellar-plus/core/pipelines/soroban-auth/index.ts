import {
  Account,
  Address,
  Operation,
  SorobanDataBuilder,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'

import { AccountHandler } from 'stellar-plus/account'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { RpcHandler } from 'stellar-plus/rpc/types'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { PSAError } from './errors'
import {
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelinePlugin,
  SorobanAuthPipelineType,
} from './types'
import { SimulateTransactionPipeline } from '../simulate-transaction'

export class SorobanAuthPipeline extends ConveyorBelt<
  SorobanAuthPipelineInput,
  SorobanAuthPipelineOutput,
  SorobanAuthPipelineType
> {
  constructor(plugins?: SorobanAuthPipelinePlugin[]) {
    super({
      type: SorobanAuthPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(item: SorobanAuthPipelineInput, itemId: string): Promise<SorobanAuthPipelineOutput> {
    const { transaction, simulation, signers, rpcHandler }: SorobanAuthPipelineInput = item

    // No internal auth to sign
    if (!simulation.result || simulation.result.auth.length === 0) return transaction

    if (signers.length === 0) throw PSAError.noSignersProvided(extractConveyorBeltErrorMeta(item, this.getMeta(itemId)))

    const authEntries: xdr.SorobanAuthorizationEntry[] = []
    for (const authEntry of simulation.result.auth) {
      const requiredSigner = Address.account(
        authEntry.credentials().address().address().accountId().ed25519()
      ).toString()

      const signer = signers.find((s) => s.getPublicKey() === requiredSigner) as AccountHandler

      if (!signer)
        throw PSAError.signerNotFound(
          extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
          transaction,
          signers.map((s) => s.getPublicKey()),
          requiredSigner,
          authEntry
        )

      const signedEntry = await signer.signSorobanAuthEntry(
        authEntry,
        await this.calculateExpirationLedgerFromTimeout(rpcHandler, transaction),
        transaction.networkPassphrase
      )
      authEntries.push(signedEntry)
    }

    let updatedTransaction
    try {
      updatedTransaction = this.updateTransaction(transaction, authEntries, simulation.transactionData)
    } catch (error) {
      throw PSAError.couldntUpdateTransaction(
        error as Error,
        extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
        transaction,
        authEntries
      )
    }
    let simulatedTransaction
    try {
      simulatedTransaction = await this.simulate(updatedTransaction, rpcHandler)
    } catch (error) {
      throw PSAError.couldntSimulateAuthorizedTransaction(
        error as Error,
        extractConveyorBeltErrorMeta(item, this.getMeta(itemId)),
        updatedTransaction,
        authEntries
      )
    }
    return simulatedTransaction
  }

  protected updateTransaction(
    transaction: Transaction,
    authEntries: xdr.SorobanAuthorizationEntry[],
    sorobanData?: SorobanDataBuilder
  ): Transaction {
    const op = transaction.toEnvelope().v1().tx().operations()[0] //as Operation.InvokeHostFunction

    const authorizedOperation = Operation.invokeHostFunction({
      func: op.body().invokeHostFunctionOp().hostFunction(),
      auth: authEntries,
    })

    const sourceAccount = new Account(transaction.source, (Number(transaction.sequence) - 1).toString())

    const updatedTransaction = new TransactionBuilder(sourceAccount, {
      fee: transaction.fee,
      memo: transaction.memo,
      networkPassphrase: transaction.networkPassphrase,
      timebounds: transaction.timeBounds,
      ledgerbounds: transaction.ledgerBounds,
      minAccountSequence: transaction.minAccountSequence,
      minAccountSequenceAge: transaction.minAccountSequenceAge,
      minAccountSequenceLedgerGap: transaction.minAccountSequenceLedgerGap,
      extraSigners: transaction.extraSigners,
      sorobanData: sorobanData?.build(),
    })

    updatedTransaction.addOperation(authorizedOperation)

    return updatedTransaction.build()
  }

  protected async simulate(transaction: Transaction, rpcHandler: RpcHandler): Promise<Transaction> {
    const simulateTransactionPipeline = new SimulateTransactionPipeline()

    const simulateOutput = await simulateTransactionPipeline.execute({
      transaction: transaction,
      rpcHandler,
    })

    return simulateOutput.assembledTransaction
  }

  protected async calculateExpirationLedgerFromTimeout(
    rpcHandler: RpcHandler,
    transaction: Transaction
  ): Promise<number> {
    // The signatures will be valid to the same ledger as the transaction
    if (transaction.ledgerBounds?.maxLedger) {
      return transaction.ledgerBounds.maxLedger
    }

    const timeout = transaction.timeBounds?.maxTime ? Number(transaction.timeBounds?.maxTime) - Date.now() / 1000 : 600 // Arbitrary 10 min default

    const ledger = await rpcHandler.getLatestLedger()

    const expirationLedger = (ledger.sequence + timeout / 5 + 1).toFixed(0)

    return Number(expirationLedger)
  }
}
