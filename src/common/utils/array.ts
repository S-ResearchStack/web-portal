export function replaceAt<T>(arr: T[], idx: number, item: T): T[] {
  const newArr = [...arr];
  if (idx <= newArr.length - 1) {
    newArr[idx] = item;
  }
  return newArr;
}

export function removeAt<T>(arr: T[], idx: number): T[] {
  const newArr = [...arr];
  newArr.splice(idx, 1);
  return newArr;
}

export function insertAfter<T>(arr: T[], idx: number, item: T): T[] {
  const newArr = [...arr];
  if (idx <= newArr.length - 1) {
    newArr.splice(idx + 1, 0, item);
  }
  return newArr;
}
