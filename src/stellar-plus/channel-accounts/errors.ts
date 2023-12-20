import { StellarPlusError } from 'stellar-plus/error'

export enum ChannelAccountsErrorCodes {
  // CHA0 General
  CHA001 = 'CHA001',
}

const invalidNumberOfChannelsToCreate = (min: number, max: number): void => {
  throw new StellarPlusError({
    code: ChannelAccountsErrorCodes.CHA001,
    message: 'Invalid number of channels to create!',
    source: 'ChannelAccounts',
    details: `Invalid number of channels to create! Must be between ${min} and ${max} for each invocation!`,
  })
}

export const throwChannelAccountsError = {
  invalidNumberOfChannelsToCreate,
}
