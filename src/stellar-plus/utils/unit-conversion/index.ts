export const fromDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount / (multiplier as any)) as T
}

export const toDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount * (multiplier as any)) as T
}

export const fromStroops = <T extends number | bigint>(amount: T): T => {
  return fromDecimals(amount, 7) as T
}

export const toStroops = <T extends number | bigint>(amount: T): T => {
  return toDecimals(amount, 7) as T
}
