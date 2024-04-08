import { AxiosError } from 'axios'

import { StellarPlusError } from 'stellar-plus/error'
import { AxiosErrorTypes, extractAxiosErrorInfo } from 'stellar-plus/error/helpers/axios'

export enum AccountBaseErrorCodes {
  // AB0 General
  AB001 = 'AB001',

  // AB1 Account creation
  AB100 = 'AB100',
  AB101 = 'AB101',
  AB102 = 'AB102',
  AB103 = 'AB103',

  // AB2 Loading from Horizon
  AB200 = 'AB200',
  AB201 = 'AB201',
}

const friendbotNotAvailableError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: AccountBaseErrorCodes.AB001,
    message: 'Friendbot not available!',
    source: 'AccountBase',
    details:
      'Friendbot is only available in test networks such as the Testnet and Futurenet. Make sure that the Network configuration object contains a valid Friendbot URL.',
    meta: { error },
  })
}

const failedToCreateAccountWithFriendbotError = (error?: Error): StellarPlusError => {
  const axiosError = extractAxiosErrorInfo(error as AxiosError)

  if (axiosError.type === AxiosErrorTypes.AxiosRequestError) {
    return new StellarPlusError({
      code: AccountBaseErrorCodes.AB101,
      message: 'Failed request when initializing account with friendbot!',
      source: 'AccountBase',
      details:
        'The request failed when initializing the account with the friendbot. Make sure that the network is available and that friendbot URL is correct.',
      meta: { axiosError, error },
    })
  }

  if (axiosError.type === AxiosErrorTypes.AxiosResponseError) {
    return new StellarPlusError({
      code: AccountBaseErrorCodes.AB102,
      message: 'Failed response when initializing account with friendbot!',
      source: 'AccountBase',
      details:
        'Received a failed response when initializing the account with the friendbot. Make sure the account has not been already initialized.',
      meta: { axiosError, error },
    })
  }

  return new StellarPlusError({
    code: AccountBaseErrorCodes.AB100,
    message: 'Unknown error when initializing account with friendbot!',
    source: 'AccountBase',
    details: 'An unexpected error occured during the friendbot invocation to initialize an account.',
    meta: { axiosError, error },
  })
}

const horizonHandlerNotAvailableError = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: AccountBaseErrorCodes.AB200,
    message: 'Horizon handler not available!',
    source: 'AccountBase',
    details:
      'Horizon handler is not available. Make sure that the Horizon handler is correctly initialized by providing an instance of Horizon handler or a network configuration when instancing the account.',
    meta: { error },
  })
}

const failedToLoadBalances = (error?: Error): StellarPlusError => {
  return new StellarPlusError({
    code: AccountBaseErrorCodes.AB201,
    message: 'Failed to load balances!',
    source: 'AccountBase',
    details:
      'Failed to load the account balances from the Horizon server. Make sure that the Horizon handler is correctly initialized and that the account has been correctly initialized.',
    meta: { error },
  })
}

export const ABError = {
  failedToCreateAccountWithFriendbotError,
  friendbotNotAvailableError,
  horizonHandlerNotAvailableError,
  failedToLoadBalances,
}
