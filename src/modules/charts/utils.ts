import _sortBy from 'lodash/sortBy';

export const degreesToRadians = (deg: number) => (deg * Math.PI) / 180;

export const sortGenderLines = <T extends { name: string }>(lines: T[]) =>
  _sortBy(lines, ({ name }) => name !== 'male');
