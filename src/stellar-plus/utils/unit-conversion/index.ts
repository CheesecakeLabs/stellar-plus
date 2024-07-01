/**
 * Converts an amount from its decimal representation.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to consider.
 * @returns The amount converted from its decimal representation.
 */
export const fromDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount / (multiplier as any)) as T
}

/**
 * Converts an amount to its decimal representation.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to consider.
 * @returns The amount converted to its decimal representation.
 */
export const toDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount * (multiplier as any)) as T
}

/**
 * Converts an amount from Stroops to the standard unit.
 *
 * @param amount - The amount in Stroops, either as a number or bigint.
 * @returns The amount converted from Stroops.
 */
export const fromStroops = <T extends number | bigint>(amount: T): T => {
  return fromDecimals(amount, 7) as T
}

/**
 * Converts an amount to Stroops from the standard unit.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @returns The amount converted to Stroops.
 */
export const toStroops = <T extends number | bigint>(amount: T): T => {
  return toDecimals(amount, 7) as T
}

/**
 * Converts a number balance to its string representation with a specified number of decimal places.
 *
 * @param amount - The number balance to convert.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the number balance.
 */
export const numberBalanceToString = (amount: number, decimal: number): string => {
  const integerPart = Math.floor(amount).toString()
  const multiplier = 10 ** decimal
  const fractionalPart = Math.round((amount - Math.floor(amount)) * multiplier)
    .toString()
    .padStart(decimal, '0')
  return `${integerPart}.${fractionalPart}`
}

/**
 * Converts a string representation of a number balance to its numeric form.
 *
 * @param amountStr - The string representation of the number balance.
 * @returns The numeric form of the balance.
 */
export const numberBalanceFromString = (amountStr: string): number => {
  const [integerPart, fractionalPart = ''] = amountStr.split('.')
  const integerAmount = parseInt(integerPart, 10)
  const fractionalAmount = fractionalPart ? parseInt(fractionalPart, 10) / 10 ** fractionalPart.length : 0
  return integerAmount + fractionalAmount
}

/**
 * Converts a bigint balance to its string representation with a specified number of decimal places.
 *
 * @param amount - The bigint balance to convert.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the bigint balance.
 */
export const bigIntBalanceToString = (amount: bigint, decimal: number): string => {
  if (decimal === 0) return amount.toString()
  const amountStr = amount.toString()
  const integerPart = amountStr.slice(0, -decimal) || '0'
  const fractionalPart = amountStr.slice(-decimal).padStart(decimal, '0')
  return `${integerPart}.${fractionalPart}`
}

/**
 * Converts a string representation of a bigint balance to its bigint form.
 *
 * @param amountStr - The string representation of the bigint balance.
 * @returns The bigint form of the balance.
 */
export const bigIntBalanceFromString = (amountStr: string): bigint => {
  const [integerPart, fractionalPart = ''] = amountStr.split('.')
  const combinedStr = integerPart + fractionalPart.padEnd(fractionalPart.length, '0')
  return BigInt(combinedStr)
}

/**
 * Converts a balance to its string representation with a specified number of decimal places.
 *
 * @param amount - The balance to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the balance.
 */
export const balanceToString = <T extends number | bigint>(amount: T, decimal: number): string => {
  return typeof amount === 'bigint' ? bigIntBalanceToString(amount, decimal) : numberBalanceToString(amount, decimal)
}
