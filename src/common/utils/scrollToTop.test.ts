import { scrollToTop } from './scrollToTop';

describe('scrollToTop util', () => {
  it('should scroll and invoke callback', () => {
    const el = document.createElement('div');
    let onScrollCb = () => {};
    jest.spyOn(el, 'addEventListener').mockImplementation((_, cb: unknown) => {
      onScrollCb = cb as typeof onScrollCb;
    });
    el.scrollTo = jest.fn();
    const scrollTopSpy = jest.spyOn(el, 'scrollTop', 'get');

    const onDone = jest.fn();

    scrollTopSpy.mockReturnValue(100);

    scrollToTop(el, onDone);

    onScrollCb();
    expect(onDone).not.toHaveBeenCalled();

    scrollTopSpy.mockReturnValue(0);
    onScrollCb();
    expect(onDone).toHaveBeenCalled();
  });

  it('[NEGATIVE] should throw error with undefined element', () => {
    expect(() => scrollToTop(undefined as unknown as HTMLElement, () => {})).toThrow();
  });

  it('[NEGATIVE] should throw error with null element', () => {
    expect(() => scrollToTop(undefined as unknown as HTMLElement, () => {})).toThrow();
  });

  it('[NEGATIVE] should throw error with invalid element', () => {
    expect(() => scrollToTop({} as unknown as HTMLElement, () => {})).toThrow();
  });
});
