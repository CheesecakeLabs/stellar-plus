/**
 * Converts an amount from its decimal representation.
 *
 * This function takes an amount, either as a number or bigint, and a specified number of decimal places,
 * and returns the amount divided by 10 to the power of the decimal places.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to consider.
 * @returns The amount converted from its decimal representation.
 *
 * @example
 * // Converts 10000000 to 1 with 7 decimal places
 * const result = fromDecimals(10000000, 7);
 */
export const fromDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount / (multiplier as any)) as T
}

/**
 * Converts an amount to its decimal representation.
 *
 * This function takes an amount, either as a number or bigint, and a specified number of decimal places,
 * and returns the amount multiplied by 10 to the power of the decimal places.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to consider.
 * @returns The amount converted to its decimal representation.
 *
 * @example
 * // Converts 1 to 10000000 with 7 decimal places
 * const result = toDecimals(1, 7);
 */
export const toDecimals = <T extends number | bigint>(amount: T, decimal: number): T => {
  const multiplier = typeof amount === 'bigint' ? BigInt(10 ** decimal) : 10 ** decimal
  return (amount * (multiplier as any)) as T
}

/**
 * Converts an amount from Stroops to the standard unit.
 *
 * This function takes an amount in Stroops (smallest unit), either as a number or bigint,
 * and converts it to the standard unit by dividing by 10^7.
 *
 * @param amount - The amount in Stroops, either as a number or bigint.
 * @returns The amount converted from Stroops.
 *
 * @example
 * // Converts 10000000 Stroops to 1 standard unit
 * const result = fromStroops(10000000);
 */
export const fromStroops = <T extends number | bigint>(amount: T): T => {
  return fromDecimals(amount, 7) as T
}

/**
 * Converts an amount to Stroops from the standard unit.
 *
 * This function takes an amount in the standard unit, either as a number or bigint,
 * and converts it to Stroops (smallest unit) by multiplying by 10^7.
 *
 * @param amount - The amount to convert, either as a number or bigint.
 * @returns The amount converted to Stroops.
 *
 * @example
 * // Converts 1 standard unit to 10000000 Stroops
 * const result = toStroops(1);
 */
export const toStroops = <T extends number | bigint>(amount: T): T => {
  return toDecimals(amount, 7) as T
}

/**
 * Converts a number balance to its string representation with a specified number of decimal places.
 *
 * This function takes a number and converts it to a string with the specified number of decimal places.
 * It handles rounding and ensures the fractional part is padded with zeros if necessary.
 *
 * @param amount - The number balance to convert.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the number balance.
 *
 * @example
 * // Converts 123.456 to '123.4560' with 4 decimal places
 * const result = numberBalanceToString(123.456, 4);
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
 * This function takes a string representing a number with a decimal point and converts it to a number.
 * It handles both integer and fractional parts.
 *
 * @param amountStr - The string representation of the number balance.
 * @returns The numeric form of the balance.
 *
 * @example
 * // Converts '123.456' to 123.456
 * const result = numberBalanceFromString('123.456');
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
 * The bigint number will be considered as the whole number to be partitioned with the specified decimals.
 * When the number of decimals is 0, no "." will be added.
 *
 * @param amount - The bigint balance to convert.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the bigint balance.
 *
 * @example
 * // Converts 123456n to '1234.56' with 2 decimal places
 * const result = bigIntBalanceToString(123456n, 2);
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
 * This function takes a string representing a bigint with a decimal point and converts it to a bigint.
 * It handles both integer and fractional parts by removing the decimal point and concatenating the parts.
 *
 * @param amountStr - The string representation of the bigint balance.
 * @returns The bigint form of the balance.
 *
 * @example
 * // Converts '1234.56' to 123456n
 * const result = bigIntBalanceFromString('1234.56');
 */
export const bigIntBalanceFromString = (amountStr: string): bigint => {
  const [integerPart, fractionalPart = ''] = amountStr.split('.')
  const combinedStr = integerPart + fractionalPart.padEnd(fractionalPart.length, '0')
  return BigInt(combinedStr)
}

/**
 * Converts a balance to its string representation with a specified number of decimal places.
 *
 * This function takes a balance, either as a number or bigint, and converts it to a string with the specified number of decimal places.
 * It delegates the conversion to either `numberBalanceToString` or `bigIntBalanceToString` based on the type of the balance.
 *
 * @param amount - The balance to convert, either as a number or bigint.
 * @param decimal - The number of decimal places to include in the string.
 * @returns The string representation of the balance.
 *
 * @example
 * // Converts 123.456 to '123.4560' with 4 decimal places
 * const result = balanceToString(123.456, 4);
 *
 * // Converts 123456n to '1234.56' with 2 decimal places
 * const result = balanceToString(123456n, 2);
 */
export const balanceToString = <T extends number | bigint>(amount: T, decimal: number): string => {
  return typeof amount === 'bigint' ? bigIntBalanceToString(amount, decimal) : numberBalanceToString(amount, decimal)
}
