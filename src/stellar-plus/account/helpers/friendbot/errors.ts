import { AxiosError } from 'axios'

import { StellarPlusError } from 'stellar-plus/error'
import { AxiosErrorTypes, extractAxiosErrorInfo } from 'stellar-plus/error/axios'
import { Meta } from 'stellar-plus/error/types'

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

const friendbotSource = 'Friendbot'

const throwFriendbotError = (code: FriendbotErrorCodes, message: string, details: string, meta?: Meta): void => {
  throw new StellarPlusError({
    code,
    message,
    source: friendbotSource,
    details,
    meta,
  })
}

export const friendbotNotAvailableError = (): void => {
  throwFriendbotError(
    FriendbotErrorCodes.FB001,
    'Friendbot is not available in this network!',
    'Friendbot is only available in test networks such as the Testnet and Futurenet. Make sure that the Network configuration object contains a valid Friendbot URL.'
  )
}

export const accountHasNoValidPublicKeyError = (): void => {
  throwFriendbotError(
    FriendbotErrorCodes.FB002,
    'Account has no valid public key!',
    'The account has no valid public key. Make sure that this account instance has been initialized corectly and contains a valid public key.'
  )
}

export const failedToCreateAccountWithFriendbotError = (error: Error): void => {
  const axiosError = extractAxiosErrorInfo(error as AxiosError)
  if (axiosError.type === AxiosErrorTypes.AxiosRequestError) {
    throwFriendbotError(
      FriendbotErrorCodes.FB101,
      'Failed request when initializing account with friendbot!',
      'The request failed when initializing the account with the friendbot. Make sure that the network is available and that friendbot URL is correct.',
      { axiosError }
    )
  }

  if (axiosError.type === AxiosErrorTypes.AxiosResponseError) {
    throwFriendbotError(
      FriendbotErrorCodes.FB102,
      'Failed response when initializing account with friendbot!',
      'Received a failed response when initializing the account with the friendbot. Make sure the account has not been already initialized.',
      { axiosError }
    )
  }

  throwFriendbotError(
    FriendbotErrorCodes.FB100,
    'Unknown error while initializing account with Friendbot',
    'An unexpected error occured during the Friendbot invocation to initialize an account.',
    {
      axiosError,
    }
  )
}
