import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'

export const extractDataFromSubmitTransactionError = (
  response: HorizonApi.SubmitTransactionResponse
): SubmitTransactionMetaInfo => {
  return {
    ...response,
  } as SubmitTransactionMetaInfo
}

export type SubmitTransactionMetaInfo = {
  hash: string
  ledger: number
  successful: boolean
  envelope_xdr: string
  result_xdr: string
  result_meta_xdr: string
  paging_token: string
}
