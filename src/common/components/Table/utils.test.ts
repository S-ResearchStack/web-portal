import { COLUMN_GAP } from './constants';
import { getColumnWidthInPercents, columnSizesToFr, replaceCharacter } from './utils';

describe('getColumnWidthInPercents test', () => {
  it('should calculate the correctly', () => {
    const callback = getColumnWidthInPercents(1000, 1200);
    const expectedValue = 1000 / (1200 - COLUMN_GAP * (5 - 1))
    expect(callback(5)).toBeCloseTo(expectedValue, 2);
  });
});

describe('columnSizesToFr test', () => {
  it('should convert column sizes correctly', () => {
    const result = columnSizesToFr([2, 1, 3]);
    expect(result).toEqual(['2px', '1fr', '3px']);
  });
});

describe('replaceCharacter test', () => {
  it('should replace the character correctly', () => {
    const line = 'abcdefg';
    const result = replaceCharacter(line, 'X', 2);
    expect(result).toBe('abXdefg');
  });

  it('[NEGATIVE] should handle edge cases', () => {
    const line = 'a';
    const result = replaceCharacter(line, 'X', 0);
    expect(result).toBe('X');
    const result2 = replaceCharacter(line, 'X', -1);
    expect(result2).toBe('X')
    const result3 = replaceCharacter(line, 'X', line.length + 1);
    expect(result2).toBe('X')
  });
});
