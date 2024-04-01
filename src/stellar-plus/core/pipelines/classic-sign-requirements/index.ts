import { FeeBumpTransaction, Operation, Transaction, xdr } from '@stellar/stellar-sdk'

import {
  ClassicSignRequirementsPipelineInput,
  ClassicSignRequirementsPipelineOutput,
  ClassicSignRequirementsPipelinePlugin,
  ClassicSignRequirementsPipelineType,
} from 'stellar-plus/core/pipelines/classic-sign-requirements/types'
import { SignatureRequirement, SignatureThreshold } from 'stellar-plus/core/types'
import { extractConveyorBeltErrorMeta } from 'stellar-plus/error/helpers/conveyor-belt'
import { ConveyorBelt } from 'stellar-plus/utils/pipeline/conveyor-belts'

import { CSRError } from './errors'

export class ClassicSignRequirementsPipeline extends ConveyorBelt<
  ClassicSignRequirementsPipelineInput,
  ClassicSignRequirementsPipelineOutput,
  ClassicSignRequirementsPipelineType
> {
  constructor(plugins?: ClassicSignRequirementsPipelinePlugin[]) {
    super({
      type: ClassicSignRequirementsPipelineType.id,
      plugins: plugins || [],
    })
  }

  protected async process(
    item: ClassicSignRequirementsPipelineInput,
    _itemId: string
  ): Promise<ClassicSignRequirementsPipelineOutput> {
    const transaction = item

    try {
      const operations = transaction instanceof FeeBumpTransaction ? [] : (transaction as Transaction).operations
      const sourceRequirement = this.getSignatureThresholdForSource(transaction)

      const operationRequirements =
        transaction instanceof FeeBumpTransaction ? [] : this.getOperationsSignatureRequirements(operations)

      const bundledRequirements = this.bundleSignatureRequirements(operationRequirements, sourceRequirement)

      return bundledRequirements
    } catch (e) {
      throw CSRError.processFailed(e as Error, extractConveyorBeltErrorMeta(item, this.getMeta(_itemId)), transaction)
    }
  }

  private getOperationsSignatureRequirements(operations: Operation[]): SignatureRequirement[] {
    const requirements: SignatureRequirement[] = []

    for (const op of operations) {
      const signerRequirements = this.getRequiredSignatureThresholdForClassicOperation(op)
      if (signerRequirements) requirements.push(signerRequirements)
    }

    return requirements
  }

  private getSignatureThresholdForSource(transaction: Transaction | FeeBumpTransaction): SignatureRequirement {
    if ((transaction as FeeBumpTransaction).innerTransaction) {
      const fbTx = transaction as FeeBumpTransaction
      return {
        publicKey: fbTx.feeSource,
        thresholdLevel: SignatureThreshold.low,
      }
    }

    const tx = transaction as Transaction
    return {
      publicKey: tx.source,
      thresholdLevel: SignatureThreshold.medium,
    }
  }

  private getRequiredSignatureThresholdForClassicOperation(operation: Operation): SignatureRequirement | void {
    const setSourceSigner = (source?: string): string => {
      return source ? source : 'source'
    }

    let thresholdLevel = SignatureThreshold.medium

    switch (operation.type) {
      case xdr.OperationType.createAccount().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }
      case xdr.OperationType.payment().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }
      case xdr.OperationType.pathPaymentStrictSend().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.pathPaymentStrictReceive().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }
      case xdr.OperationType.manageSellOffer().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.manageBuyOffer().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.createPassiveSellOffer().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.setOptions().name:
        if (
          (operation as Operation.SetOptions).masterWeight ||
          (operation as Operation.SetOptions).signer ||
          (operation as Operation.SetOptions).lowThreshold ||
          (operation as Operation.SetOptions).medThreshold ||
          (operation as Operation.SetOptions).highThreshold
        ) {
          thresholdLevel = SignatureThreshold.high
        }

        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.changeTrust().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.allowTrust().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel: SignatureThreshold.low,
        }

      case xdr.OperationType.accountMerge().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.manageData().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.bumpSequence().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel: SignatureThreshold.low,
        }

      case xdr.OperationType.createClaimableBalance().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.claimClaimableBalance().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.beginSponsoringFutureReserves().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.endSponsoringFutureReserves().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.revokeSponsorship().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.clawback().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.clawbackClaimableBalance().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.setTrustLineFlags().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel: SignatureThreshold.low,
        }

      case xdr.OperationType.liquidityPoolDeposit().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }

      case xdr.OperationType.liquidityPoolWithdraw().name:
        return {
          publicKey: setSourceSigner(operation.source),
          thresholdLevel,
        }
    }
  }

  private bundleSignatureRequirements(
    operationRequirements: SignatureRequirement[],
    sourceRequirement: SignatureRequirement
  ): SignatureRequirement[] {
    const bundledRequirements: SignatureRequirement[] = [sourceRequirement]

    for (const requirement of operationRequirements) {
      const publicKey = requirement.publicKey === 'source' ? sourceRequirement.publicKey : requirement.publicKey

      const index = bundledRequirements.findIndex((r) => r.publicKey === publicKey)
      if (index === -1) {
        bundledRequirements.push({
          publicKey,
          thresholdLevel: requirement.thresholdLevel,
        })
      } else {
        bundledRequirements[index].thresholdLevel = Math.max(
          bundledRequirements[index].thresholdLevel,
          requirement.thresholdLevel
        )
      }
    }

    return bundledRequirements
  }
}
