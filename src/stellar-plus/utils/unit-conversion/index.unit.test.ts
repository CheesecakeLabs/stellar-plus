import { fromDecimals, fromStroops, toDecimals, toStroops } from '.'

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
})
