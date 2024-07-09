import {
  fromDecimals,
  fromStroops,
  toDecimals,
  toStroops,
  bigIntBalanceToString,
  bigIntBalanceFromString,
  numberBalanceToString,
  numberBalanceFromString,
  balanceToString,
} from '.'

describe('Unit conversion', () => {
  describe('function toStroops', () => {
    it('should convert number amounts to stroops(7 decimals) and return a number', () => {
      expect(toStroops(152)).toBe(1520000000)
    })

    it('should convert bigint amounts to stroops(7 decimals) and return a bigint', () => {
      expect(toStroops(BigInt(131))).toBe(BigInt(1310000000))
    })
  })

  describe('function fromStroops', () => {
    it('should convert number amounts from stroops(7 decimals) and return a number', () => {
      expect(fromStroops(1520000000)).toBe(152)
    })

    it('should convert bigint amounts from stroops(7 decimals) and return a bigint', () => {
      expect(fromStroops(BigInt(1310000000))).toBe(BigInt(131))
    })
  })

  describe('function toDecimal', () => {
    it('should convert number amounts to any decimals and return a number', () => {
      expect(toDecimals(297, 2)).toBe(29700)
    })

    it('should convert bigint amounts to any decimals  and return a bigint', () => {
      expect(toDecimals(BigInt(987), 4)).toBe(BigInt(9870000))
    })
  })

  describe('function fromStroops', () => {
    it('should convert number amounts from any decimals  and return a number', () => {
      expect(fromDecimals(67500000000, 8)).toBe(675)
    })

    it('should convert bigint amounts from any decimals  and return a bigint', () => {
      expect(fromDecimals(BigInt(454000000), 6)).toBe(BigInt(454))
    })
  })

  describe('number balances and strings', () => {
    it('numberBalanceToString should convert number amounts to strings with a "." separator and the number of explicit decimals', () => {
      expect(numberBalanceToString(329, 4)).toBe('329.0000')
      expect(numberBalanceToString(329.6, 4)).toBe('329.6000')
      expect(numberBalanceToString(0.006, 4)).toBe('0.0060')
    })
    it('numberBalanceToString should round numbers properly when shortenning the decimals', () => {
      expect(numberBalanceToString(0.3297, 3)).toBe('0.330')
      expect(numberBalanceToString(0.3294, 3)).toBe('0.329')
      expect(numberBalanceToString(1.006, 2)).toBe('1.01')
      expect(numberBalanceToString(1.005, 2)).toBe('1.00')
    })

    it('numberBalanceFromString should convert string amounts to number considering a "." separator', () => {
      expect(numberBalanceFromString('329.0000')).toBe(329)
      expect(numberBalanceFromString('329.6000')).toBe(329.6)
      expect(numberBalanceFromString('721.00006000')).toBe(721.00006)
      expect(numberBalanceFromString('0.329')).toBe(0.329)
      expect(numberBalanceFromString('0.00001000')).toBe(0.00001)
      expect(numberBalanceFromString('1.01')).toBe(1.01)
      expect(numberBalanceFromString('123')).toBe(123)
    })
  })
  describe('bigint balances and strings', () => {
    it('bigIntBalanceToString should convert bigint amounts to strings with a "." separator and the number of explicit decimals', () => {
      expect(bigIntBalanceToString(BigInt(32900000000), 4)).toBe('3290000.0000')
      expect(bigIntBalanceToString(BigInt(32960000000), 4)).toBe('3296000.0000')
      expect(bigIntBalanceToString(BigInt(32960000000), 5)).toBe('329600.00000')
      expect(bigIntBalanceToString(BigInt(32960000000), 6)).toBe('32960.000000')
      expect(bigIntBalanceToString(BigInt(32960000000), 7)).toBe('3296.0000000')
      expect(bigIntBalanceToString(BigInt(32960000000), 8)).toBe('329.60000000')
      expect(bigIntBalanceToString(BigInt(3296), 3)).toBe('3.296')
      expect(bigIntBalanceToString(BigInt(3296), 4)).toBe('0.3296')
      expect(bigIntBalanceToString(BigInt(3296), 5)).toBe('0.03296')
      expect(bigIntBalanceToString(BigInt(3296), 6)).toBe('0.003296')
      expect(bigIntBalanceToString(BigInt(3296), 7)).toBe('0.0003296')
    })

    it('bigIntBalanceFromStringshould convert strings with a "." separator to bigint amounts', () => {
      expect(bigIntBalanceFromString('3290.0000').toString()).toBe(BigInt(32900000).toString())
      expect(bigIntBalanceFromString('3296.0000').toString()).toBe(BigInt(32960000).toString())
      expect(bigIntBalanceFromString('0.3296').toString()).toBe(BigInt(3296).toString())
      expect(bigIntBalanceFromString('123').toString()).toBe(BigInt(123).toString())
    })

    it('bigIntBalanceToString and bigIntBalanceFromStringshould should be consisten both ways', () => {
      expect(bigIntBalanceToString(bigIntBalanceFromString('3290.0000'), 4)).toBe('3290.0000')
      expect(bigIntBalanceToString(bigIntBalanceFromString('3290.0000'), 3)).toBe('32900.000')
      expect(bigIntBalanceToString(bigIntBalanceFromString('3290.0000'), 2)).toBe('329000.00')
      expect(bigIntBalanceToString(bigIntBalanceFromString('3290.0000'), 1)).toBe('3290000.0')
      expect(bigIntBalanceToString(bigIntBalanceFromString('3290.0000'), 0)).toBe('32900000')

      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(1234), 0)).toString()).toBe(BigInt(1234).toString())
      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(5678), 1)).toString()).toBe(BigInt(5678).toString())
      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(9876), 2)).toString()).toBe(BigInt(9876).toString())
      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(5432), 3)).toString()).toBe(BigInt(5432).toString())
      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(1122), 4)).toString()).toBe(BigInt(1122).toString())
      expect(bigIntBalanceFromString(bigIntBalanceToString(BigInt(1), 5)).toString()).toBe(BigInt(1).toString())
    })
  })

  describe('general balances and strings', () => {
    it('should convert number amounts to strings with a "." separator and the number of explicit decimals', () => {
      expect(balanceToString(329, 4)).toBe('329.0000')
      expect(balanceToString(329.6, 4)).toBe('329.6000')
      expect(balanceToString(0.3296, 4)).toBe('0.3296')
    })

    it('should convert bigint amounts to strings with a "." separator and the number of explicit decimals', () => {
      expect(balanceToString(BigInt(32900000000), 4)).toBe('3290000.0000')
      expect(balanceToString(BigInt(32960000000), 4)).toBe('3296000.0000')
      expect(balanceToString(BigInt(3296), 4)).toBe('0.3296')
    })
  })
})
