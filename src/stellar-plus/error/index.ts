import { TransactionDiagnostic } from './helpers/horizon'
import { ErrorCodes, GeneralErrorCodes, Meta, StellarPlusErrorObject } from './types'

export class StellarPlusError extends Error {
  code: ErrorCodes
  source: string
  details?: string
  meta?: Meta
  diagnostic?: TransactionDiagnostic

  constructor(e: StellarPlusErrorObject) {
    super(e.message)
    this.code = e.code
    this.source = e.source
    this.details = e.details
    this.diagnostic = e.diagnostic
    this.meta = e.meta
    this.name = this.constructor.name
  }

  static unexpectedError(args?: {
    code?: ErrorCodes
    source?: string
    message?: string
    details?: string
    meta?: Meta
    error?: Error
  }): StellarPlusError {
    const code = args?.code ?? GeneralErrorCodes.ER000
    const source = args?.source ?? 'StellarPlus'
    const message = args?.message ?? 'Unexpected error!'
    const details = args?.details ?? 'An unexpected error occurred.'
    const meta = args?.meta

    return new StellarPlusError({
      code,
      source,
      message,
      details,
      meta: { ...meta, error: args?.error },
    })
  }

  static fromUnkownError(error: unknown): StellarPlusError {
    if (error instanceof StellarPlusError) {
      return error
    }

    return StellarPlusError.unexpectedError({ error: error as Error })
  }
}
