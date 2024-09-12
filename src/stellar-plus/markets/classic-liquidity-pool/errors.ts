import { StellarPlusError } from 'stellar-plus/error'

export enum ClassicLiquidityPoolHandlerErrorCodes {
  CLPH001 = 'CLPH001',
  CLPH002 = 'CLPH002',
  CLPH003 = 'CLPH003',
  CLPH004 = 'CLPH004',
  CLPH005 = 'CLPH005',
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

const liquidityPoolNotFound = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicLiquidityPoolHandlerErrorCodes.CLPH003,
    message: 'Liquidity pool not found!',
    source: 'ClassicLiquidityPoolHandler',
    details: 'The specified liquidity pool could not be found. Please check the liquidity pool ID and try again.',
  })
}

const liquidityPoolRequiredAssets = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicLiquidityPoolHandlerErrorCodes.CLPH004,
    message: 'Liquidity pool missing required assets!',
    source: 'ClassicLiquidityPoolHandler',
    details:
      'The liquidity pool does not have the two required assets. Ensure the liquidity pool includes both assets.',
  })
}

const failedToCreateHandlerFromLiquidityPoolId = (): StellarPlusError => {
  return new StellarPlusError({
    code: ClassicLiquidityPoolHandlerErrorCodes.CLPH005,
    message: 'Failed to create handler from liquidity pool ID!',
    source: 'ClassicLiquidityPoolHandler',
    details:
      'The handler could not be created from the provided liquidity pool ID. Verify the liquidity pool ID and the assets involved.',
  })
}

export const CLPHError = {
  liquidityPoolIdNotDefined,
  trustlineAlreadyExists,
  liquidityPoolNotFound,
  liquidityPoolRequiredAssets,
  failedToCreateHandlerFromLiquidityPoolId,
}
