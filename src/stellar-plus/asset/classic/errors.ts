import { StellarPlusError } from 'stellar-plus/error'

export enum ClassicAssetHandlerErrorCodes {
  // CAH0 General
  CAH001 = 'CAH001',
}

const issuerAccountNotDefined = (): void => {
  throw new StellarPlusError({
    code: ClassicAssetHandlerErrorCodes.CAH001,
    message: 'Issuer account not defined!',
    source: 'ClassicAssetHandler',
    details:
      "The issuer account is not defined. To access asset management functions, make sure to provide an AccountHandler for this asset's issuer account. This accountis required to parametrize and authorize these functions.",
  })
}

export const throwClassicAssetHandlerError = {
  issuerAccountNotDefined,
}
