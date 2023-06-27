import { sortGenderLines } from './utils';

describe('chart utils', () => {
  it('sortGenderLines', () => {
    expect(sortGenderLines([{ name: 'male' }, { name: 'female' }, { name: 'male' }])).toEqual([
      { name: 'male' },
      { name: 'male' },
      { name: 'female' },
    ]);
  });

  it('[NEGATIVE] sortGenderLines empty input', () => {
    expect(sortGenderLines([])).toEqual([]);
  });

  it('[NEGATIVE] sortGenderLines undefined input', () => {
    expect(sortGenderLines(undefined as unknown as { name: string }[])).toEqual([]);
  });
});
