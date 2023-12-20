import { ErrorCodes, Meta, StellarPlusErrorObject } from './types'

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
}
