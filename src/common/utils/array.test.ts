import { insertAfter, removeAt, replaceAt } from 'src/common/utils/array';

describe('replaceAt util', () => {
  type ArrayItem = { value: number };
  const array: ArrayItem[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

  it('should replace item by index', () => {
    const newArray = replaceAt(array, 1, { value: 4 });
    expect(newArray[1].value).toEqual(4);
  });
  it('[NEGATIVE] should not replace item by index out range of array', () => {
    const newArray = replaceAt(array, 10, { value: 4 });
    expect(newArray).toEqual(array);
  });
  it('[NEGATIVE] should not replace item if array is empty', () => {
    const arr: ArrayItem[] = [];
    const newArray = replaceAt(arr, 1, { value: 4 });
    expect(newArray).toEqual([]);
  });
  it('[NEGATIVE] should throw if array is undefined', () => {
    expect(() => replaceAt(undefined as unknown as number[], 0, 1)).toThrow();
  });
});

describe('removeAt util', () => {
  type ArrayItem = { value: number };
  const array: ArrayItem[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

  it('should remove item by index', () => {
    const newArray = removeAt(array, 1);
    expect(newArray).toEqual([{ value: 1 }, { value: 3 }]);
  });
  it('[NEGATIVE] should not remove item by index out range of array', () => {
    const newArray = removeAt(array, 10);
    expect(newArray).toEqual(array);
  });
  it('[NEGATIVE] should not remove item if array is empty', () => {
    const arr: ArrayItem[] = [];
    const newArray = removeAt(arr, 1);
    expect(newArray).toEqual([]);
  });
  it('[NEGATIVE] should throw if array is undefined', () => {
    expect(() => removeAt(undefined as unknown as number[], 0)).toThrow();
  });
});

describe('insertAfter util', () => {
  type ArrayItem = { value: number };
  const array: ArrayItem[] = [{ value: 1 }, { value: 2 }];

  it('should insert item by index', () => {
    const newArray = insertAfter(array, 1, { value: 3 });
    expect(newArray).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });
  it('[NEGATIVE] should not insert item by index out range of array', () => {
    const newArray = insertAfter(array, 10, { value: 3 });
    expect(newArray).toEqual([{ value: 1 }, { value: 2 }]);
  });
  it('[NEGATIVE] should not insert item if array is empty', () => {
    const arr: ArrayItem[] = [];
    const newArray = insertAfter(arr, 1, { value: 3 });
    expect(newArray).toEqual([]);
  });
  it('[NEGATIVE] should throw if array is undefined', () => {
    expect(() => insertAfter(undefined as unknown as number[], 0, 1)).toThrow();
  });
});
