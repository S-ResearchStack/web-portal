import { format, parseNumber, formatOrdinals, roundNumber } from './number';

describe('number util', () => {
  it('should format number', () => {
    expect(format(10)).toBe('10');
    expect(format(10.25)).toBe('10.25');
  });

  it('[NEGATIVE] should format invalid number', () => {
    expect(format(NaN)).toBe('NaN');
    expect(format(null as unknown as number)).toBe('0');
  });

  it('should parse number', () => {
    expect(parseNumber('10.25')).toBe(10.25);
    expect(parseNumber('10.25', { round: false })).toBe(10.25);
    expect(parseNumber('10.25', { round: true })).toBe(10);
  });

  it('[NEGATIVE] shoud parse invalid number', () => {
    expect(parseNumber('invalid')).toBe(undefined);
  });

  it('should round number', () => {
    expect(roundNumber(2.56)).toBe(3);
    expect(roundNumber(2.44)).toBe(2);
    expect(roundNumber(2.0001)).toBe(2);
  });

  it('[NEGATIVE] should round invalid number', () => {
    expect(roundNumber(undefined)).toBe(undefined);
    expect(roundNumber(null)).toBe(undefined);
    expect(roundNumber(NaN)).toBe(undefined);
  });

  it('should format ordinals', () => {
    expect(formatOrdinals('1')).toBe('1st');
    expect(formatOrdinals('2')).toBe('2nd');
  });

  it('[NEGATIVE] should format invalid ordinals', () => {
    // TODO: handle invalid numbers better
    expect(formatOrdinals('')).toBe('th');
  });
});
