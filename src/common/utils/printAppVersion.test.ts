import printAppVersion from './printAppVersion';

describe('printAppVersion util', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should print app version', () => {
    process.env.VERSION = '1.0';
    const logSpy = jest.spyOn(console, 'log');

    printAppVersion();

    expect(logSpy).toHaveBeenCalledOnceWith('[App] Version: 1.0');
  });

  it('[NEGATIVE] should print app version even if not set', () => {
    process.env.VERSION = undefined as unknown as string;
    const logSpy = jest.spyOn(console, 'log');

    printAppVersion();

    expect(logSpy).toHaveBeenCalledOnceWith('[App] Version: undefined');
  });
});
