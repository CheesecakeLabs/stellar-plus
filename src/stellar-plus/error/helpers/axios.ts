import axios, { AxiosError } from 'axios'

export enum AxiosErrorTypes {
  AxiosResponseError = 'AxiosResponseError',
  AxiosRequestError = 'AxiosRequestError',
  UnknownError = 'UnknownError',
}

export type AxiosRequestType = typeof axios.defaults.adapter extends (...args: any[]) => any
  ? ReturnType<typeof axios.defaults.adapter>
  : never

export type AxiosErrorInfo = {
  type: AxiosErrorTypes
  message: string
  code?: string
  status?: number
  statusText?: string
  data?: any | undefined
  request?: AxiosRequestType
  url?: string
}

export const extractAxiosErrorInfo = (error: AxiosError): AxiosErrorInfo => {
  if (error.response) {
    return {
      type: AxiosErrorTypes.AxiosResponseError,
      message: error.message,
      code: error.code,
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      url: error.config?.url,
    }
  } else if (error.request) {
    return {
      type: AxiosErrorTypes.AxiosRequestError,
      message: 'No response received',
      request: error.request as AxiosRequestType,
      url: error.config?.url,
    }
  } else {
    return {
      type: AxiosErrorTypes.UnknownError,
      message: error.message || 'An unknown error occurred',
    }
  }
}
