import React, { useRef } from 'react';
import { render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useClickAwayGroup from 'src/common/utils/useClickAwayGroup';

describe('useClickAwayGroup util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call cb function', async () => {
    const { result: parentRef } = renderHook(() => useRef(null));
    const { result: itemRef } = renderHook(() => useRef(null));
    const { getByTestId } = render(
      <div data-testid="parent" ref={parentRef.current}>
        <div data-testid="item" ref={itemRef.current} />
      </div>
    );
    const onClickCb = jest.fn();
    const parent = getByTestId('parent');

    renderHook(() => useClickAwayGroup([itemRef.current], onClickCb));

    await userEvent.click(parent);
    expect(onClickCb).toHaveBeenCalledTimes(1);
  });

  it('[NEGATIVE] should not call cb function', async () => {
    const { result: parentRef } = renderHook(() => useRef(null));
    const { result: itemRef } = renderHook(() => useRef(null));
    const { getByTestId } = render(
      <div data-testid="parent" ref={parentRef.current}>
        <div data-testid="item" ref={itemRef.current} />
      </div>
    );
    const onClickCb = jest.fn();
    const item = getByTestId('item');

    renderHook(() => useClickAwayGroup([itemRef.current], onClickCb));

    await userEvent.click(item);
    expect(onClickCb).not.toHaveBeenCalled();
  });

  it('[NEGATIVE] should not call cb function if empty array passed', async () => {
    const { baseElement } = render(<div />);
    const onClickCb = jest.fn();

    renderHook(() => useClickAwayGroup([], onClickCb));

    await userEvent.click(baseElement);
    expect(onClickCb).not.toHaveBeenCalled();
  });
});
