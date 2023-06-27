import type { MatchedBrowser } from './browser';

describe('browser utils', () => {
  let browser: MatchedBrowser = {
    isSafari: false,
    isFirefox: false,
    isChrome: false,
    isEdge: false,
    isIe: false,
  };
  const reloadBrowser = () =>
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      browser = require('./browser').default;
    });
  it('should predict browser from user agent or vendor', () => {
    const vendorSpy = jest.spyOn(window.navigator, 'vendor', 'get');
    const userAgent = jest.spyOn(window.navigator, 'userAgent', 'get');

    reloadBrowser();

    vendorSpy.mockReturnValue('test Google test browser');
    userAgent.mockReturnValue('something');
    reloadBrowser();
    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: false,
      isChrome: true,
      isEdge: false,
      isIe: false,
    });

    vendorSpy.mockReturnValue('test ApPle test browser');
    userAgent.mockReturnValue('something');
    reloadBrowser();
    expect(browser).toMatchObject({
      isSafari: true,
      isFirefox: false,
      isChrome: false,
      isEdge: false,
      isIe: false,
    });

    vendorSpy.mockReturnValue('something');
    userAgent.mockReturnValue('test FireFox/123 test browser');
    reloadBrowser();
    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: true,
      isChrome: false,
      isEdge: false,
      isIe: false,
    });

    vendorSpy.mockReturnValue('something');
    userAgent.mockReturnValue('test EDGE/123 test browser');
    reloadBrowser();
    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: false,
      isChrome: false,
      isEdge: true,
      isIe: false,
    });

    vendorSpy.mockReturnValue('something');
    userAgent.mockReturnValue('test Trident/123 test browser');
    reloadBrowser();
    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: false,
      isChrome: false,
      isEdge: false,
      isIe: true,
    });
  });

  it('[NEGATIVE] should return all false for unknown browser', () => {
    const vendorSpy = jest.spyOn(window.navigator, 'vendor', 'get');
    const userAgent = jest.spyOn(window.navigator, 'userAgent', 'get');

    vendorSpy.mockReturnValue('some unknown browser');
    userAgent.mockReturnValue('some unknown browser');
    reloadBrowser();

    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: false,
      isChrome: false,
      isEdge: false,
      isIe: false,
    });
  });

  it('[NEGATIVE] should return all false for undefined browser', () => {
    const vendorSpy = jest.spyOn(window.navigator, 'vendor', 'get');
    const userAgent = jest.spyOn(window.navigator, 'userAgent', 'get');

    vendorSpy.mockReturnValue(undefined as unknown as string);
    userAgent.mockReturnValue(undefined as unknown as string);
    reloadBrowser();

    expect(browser).toMatchObject({
      isSafari: false,
      isFirefox: false,
      isChrome: false,
      isEdge: false,
      isIe: false,
    });
  });
});
