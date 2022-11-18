import { COLUMN_GAP, DEFAULT_TABLE_WIDTH } from './constants';
import { ColumnsSizes, ColumnWidthInPercentsCallback } from './types';

export const getColumnWidthInPercents =
  (w: number, tw = DEFAULT_TABLE_WIDTH): ColumnWidthInPercentsCallback =>
  (cc) =>
    w / (tw - COLUMN_GAP * (cc - 1));

export const columnSizesToFr = (values: ColumnsSizes): string[] =>
  values.map((value: number): string => (value > 1 ? `${value}px` : `${value}fr`));

export const replaceCharacter = (line: string, character: string, position: number) => {
  const arr = Array.from(line);
  arr.splice(position, 1, character);
  return arr.join('');
};
