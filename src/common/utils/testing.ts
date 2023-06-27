import _constant from 'lodash/constant';
import waitFor from './waitFor';

export const isInsideTest = process.env.NODE_ENV === 'test';

export function expectToBeDefined<T>(v: T): asserts v is NonNullable<T> {
  expect(v).toBeDefined();
}

export const isPromiseResolved = <T>(p: Promise<T>) =>
  Promise.race([waitFor(0).then(_constant(false)), p.then(_constant(true), _constant(false))]);

export const isPromiseRejected = <T>(p: Promise<T>) =>
  Promise.race([waitFor(0).then(_constant(false)), p.then(_constant(false), _constant(true))]);

export const isPromiseFinished = <T>(p: Promise<T>) =>
  Promise.race([waitFor(0).then(_constant(false)), p.then(_constant(true), _constant(true))]);
