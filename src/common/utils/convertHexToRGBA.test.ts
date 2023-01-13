import convertHexToRGBA from './convertHexToRGBA';

describe('convertHexToRGBA util', () => {
  it('should convert color', () => {
    expect(convertHexToRGBA('#ab19dd')).toBe('rgba(171, 25, 221, 1)');
    expect(convertHexToRGBA('#ab19dd', 0.5)).toBe('rgba(171, 25, 221, 0.5)');
    expect(convertHexToRGBA('red')).toBe('red');
  });

  it('[NEGATIVE] should not try to convert invalid colors', () => {
    expect(convertHexToRGBA('#invalid')).toBe('#invalid');
  });

  it('[NEGATIVE] should not try to convert short colors', () => {
    expect(convertHexToRGBA('#ab19')).toBe('#ab19');
  });

  it('[NEGATIVE] should not try to convert empty string', () => {
    expect(convertHexToRGBA('')).toBe('');
  });

  it('[NEGATIVE] should throw with undefined color', () => {
    expect(() => convertHexToRGBA(undefined as unknown as string)).toThrow();
  });

  it('[NEGATIVE] should throw with null color', () => {
    expect(() => convertHexToRGBA(null as unknown as string)).toThrow();
  });

  it('[NEGATIVE] should throw with non-string color', () => {
    expect(() => convertHexToRGBA({} as unknown as string)).toThrow();
  });
});
