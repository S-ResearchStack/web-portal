let counter = 0;
jest.mock(
  'lodash/uniqueId',
  () =>
    (prefix = '') =>
      // eslint-disable-next-line no-plusplus
      `${prefix}${++counter}`
);

beforeEach(() => {
  counter = 0;
});
