import { createLimit, predictZipFileSize } from './downloadMultiple';
import { isPromiseFinished, isPromiseRejected, isPromiseResolved } from './testing';

describe('downloadMultiple', () => {
  describe('createLimit', () => {
    it('should wait when max reached', async () => {
      const limit = createLimit(1);
      const w1 = limit.waitAndLock();
      const w2 = limit.waitAndLock();

      expect(await isPromiseResolved(w1)).toBeTrue();
      expect(await isPromiseFinished(w2)).toBeFalse();

      limit.unlock();
      expect(await isPromiseResolved(w2)).toBeTrue();
    });

    it('[NEGATIVE] should reject on cancel', async () => {
      const limit = createLimit(1);
      const w1 = limit.waitAndLock();
      const w2 = limit.waitAndLock();
      const w3 = limit.waitAndLock();

      expect(await isPromiseResolved(w1)).toBeTrue();
      expect(await isPromiseFinished(w2)).toBeFalse();
      expect(await isPromiseFinished(w3)).toBeFalse();

      limit.cancelPending();
      expect(await isPromiseRejected(w2)).toBeTrue();
      expect(await isPromiseRejected(w3)).toBeTrue();
    });
  });

  describe('predictZipFileSize', () => {
    it('should predict file size', () => {
      expect(
        predictZipFileSize([
          {
            name: 'n1',
            size: 100,
          },
          {
            name: 'n2',
            size: 10,
          },
        ])
      ).toEqual(328);

      expect(
        predictZipFileSize(
          [
            {
              name: 'n1',
              size: 100,
            },
            {
              name: 'n2',
              size: 10,
            },
          ],
          { onlyMeta: true }
        )
      ).toEqual(218);
    });

    it('[NEGATIVE] should predict file size for empty list', () => {
      expect(predictZipFileSize([])).toEqual(22);
      expect(predictZipFileSize([], { onlyMeta: true })).toEqual(22);
    });
  });
});
