export function expectToBeDefined<T>(v: T): asserts v is NonNullable<T> {
  expect(v).toBeDefined();
}
