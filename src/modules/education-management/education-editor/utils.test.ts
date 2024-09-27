import { newId } from './utils';

describe('newId', () => {
  it('should create unique id', () => {
    expect(newId()).toMatch('education');
    expect(newId()).not.toBe(newId());
  });
});
