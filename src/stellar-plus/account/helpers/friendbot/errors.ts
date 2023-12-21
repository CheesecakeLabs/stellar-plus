import { AxiosError } from 'axios'

import { StellarPlusError } from 'stellar-plus/error'
import { AxiosErrorTypes, extractAxiosErrorInfo } from 'stellar-plus/error/helpers/axios'

export enum FriendbotErrorCodes {
  // F0 General
  FB001 = 'FB001',
  FB002 = 'FB002',
  FB003 = 'FB003',
  // F1 Account creation
  FB100 = 'FB100',
  FB101 = 'FB101',
  FB102 = 'FB102',
  FB103 = 'FB103',
}

const friendbotNotAvailableError = (): StellarPlusError => {
  return new StellarPlusError({
    code: FriendbotErrorCodes.FB001,
    message: 'Friendbot not available!',
    source: 'Friendbot',
    details:
      'Friendbot is only available in test networks such as the Testnet and Futurenet. Make sure that the Network configuration object contains a valid Friendbot URL.',
  })
}

const accountHasNoValidPublicKeyError = (): StellarPlusError => {
  return new StellarPlusError({
    code: FriendbotErrorCodes.FB002,
    message: 'Account has no valid public key!',
    source: 'Friendbot',
    details:
      'The account has no valid public key. Make sure that this account instance has been initialized corectly and contains a valid public key.',
  })
}

const failedToCreateAccountWithFriendbotError = (error: Error): StellarPlusError => {
  const axiosError = extractAxiosErrorInfo(error as AxiosError)
  if (axiosError.type === AxiosErrorTypes.AxiosRequestError) {
    return new StellarPlusError({
      code: FriendbotErrorCodes.FB101,
      message: 'Failed request when initializing account with friendbot!',
      source: 'Friendbot',
      details:
        'The request failed when initializing the account with the friendbot. Make sure that the network is available and that friendbot URL is correct.',
      meta: { axiosError },
    })
  }

  if (axiosError.type === AxiosErrorTypes.AxiosResponseError) {
    return new StellarPlusError({
      code: FriendbotErrorCodes.FB102,
      message: 'Failed response when initializing account with friendbot!',
      source: 'Friendbot',
      details:
        'Received a failed response when initializing the account with the friendbot. Make sure the account has not been already initialized.',
      meta: { axiosError },
    })
  }

  return new StellarPlusError({
    code: FriendbotErrorCodes.FB100,
    message: 'Unknown error when initializing account with friendbot!',
    source: 'Friendbot',
    details: 'An unexpected error occured during the friendbot invocation to initialize an account.',
    meta: { axiosError },
  })
}

export const FBError = {
  accountHasNoValidPublicKeyError,
  failedToCreateAccountWithFriendbotError,
  friendbotNotAvailableError,
}
