Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  x: 0,
  y: 0,
  right: 0,
  top: 0,
  width: 0,
  toJSON: jest.fn(),
});

Range.prototype.getClientRects = () => ({
  item: () => null,
  length: 0,
  [Symbol.iterator]: jest.fn(),
});
