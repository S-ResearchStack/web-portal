import waitFor from './waitFor';

describe('waitFor util', () => {
  it('should resolve after timeout', async () => {
    jest.useFakeTimers();

    let done = false;
    waitFor(100).then(() => {
      done = true;
    });

    expect(done).toBeFalsy();
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(done).toBeTruthy();
  });

  it('[NEGATIVE] should resolve right await with invalid timeout', async () => {
    jest.useFakeTimers();

    let done = false;
    waitFor(-1).then(() => {
      done = true;
    });

    expect(done).toBeFalsy();
    jest.advanceTimersByTime(0);
    await Promise.resolve();
    expect(done).toBeTruthy();
  });

  it('[NEGATIVE] should resolve right await with 0 timeout', async () => {
    jest.useFakeTimers();

    let done = false;
    waitFor(0).then(() => {
      done = true;
    });

    expect(done).toBeFalsy();
    jest.advanceTimersByTime(0);
    await Promise.resolve();
    expect(done).toBeTruthy();
  });
});
