import { StellarPlusError } from 'stellar-plus/error'

export enum ClassicLiquidityPoolHandlerErrorCodes {
  CLPH001 = 'CLPH001',
  CLPH002 = 'CLPH002',
}

const liquidityPoolIdNotDefined = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicLiquidityPoolHandlerErrorCodes.CLPH001,
    message: 'Liquidity Pool ID not defined!',
    source: 'ClassicLiquidityPoolHandler',
    details:
      'The liquidity pool ID is required for this operation. Ensure that the liquidity pool ID is defined and provided correctly.',
  })
}

const trustlineAlreadyExists = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicLiquidityPoolHandlerErrorCodes.CLPH002,
    message: 'Trustline already exists!',
    source: 'ClassicLiquidityPoolHandler',
    details:
      'A trustline for this liquidity pool already exists for the specified account. Ensure that the trustline is not already set up before attempting to create a new one.',
  })
}

export const CLPHError = {
  liquidityPoolIdNotDefined,
  trustlineAlreadyExists,
}
