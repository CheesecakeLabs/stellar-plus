import { ErrorCodes, GeneralErrorCodes, Meta, StellarPlusErrorObject } from './types'

export class StellarPlusError extends Error {
  code: ErrorCodes
  source: string
  details?: string
  meta?: Meta

  constructor(e: StellarPlusErrorObject) {
    super(e.message)
    this.code = e.code
    this.source = e.source
    this.details = e.details
    this.meta = e.meta
    this.name = this.constructor.name
  }

  static throwUnexpectedError(args?: {
    code?: ErrorCodes
    source?: string
    message?: string
    details?: string
    meta?: Meta
  }): void {
    const code = args?.code ?? GeneralErrorCodes.ER000
    const source = args?.source ?? 'StellarPlus'
    const message = args?.message ?? 'Unexpected error!'
    const details = args?.details ?? 'An unexpected error occurred.'
    const meta = args?.meta

    throw new StellarPlusError({
      code,
      source,
      message,
      details,
      meta,
    })
  }
}
