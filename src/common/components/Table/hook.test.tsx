import React from 'react';
import { act,  renderHook,  waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { useCellTooltip } from './hooks';

const getContainerFn = jest.fn().mockReturnValue({
  offsetWidth: 0,
  scrollWidth: 1,
  getBoundingClientRect() {
    return { left: 0, right: 0, bottom: 0, top: 0 };
  },
} as HTMLElement);
const getTooltipFn = jest.fn().mockReturnValue({
  getBoundingClientRect() {
    return { height: 0, width: 0 };
  },
} as HTMLElement);
const setPositionFn = jest.fn();

const mockTooltipRef = {
  current: {
    getContainer: getContainerFn,
    getTooltip: getTooltipFn,
    setPosition: setPositionFn,
  },
};

describe('useCellTooltip test', () => {
  it('should return correctly', () => {
    const { result } = renderHook(() => useCellTooltip(mockTooltipRef as any));
    const { isShowTooltip, handleMouseEnter, handleMouseLeave, currentPos, tooltipStyles } =
      result.current;

    expect(isShowTooltip).toBe(false);
    expect(handleMouseEnter).toBeInstanceOf(Function);
    expect(handleMouseLeave).toBeInstanceOf(Function);
    expect(currentPos).toEqual('abl');
    expect(tooltipStyles).toEqual({ visibility: 'hidden' });
  });
  it('should handle mouse enter', async () => {
    const { result } = renderHook(() => useCellTooltip(mockTooltipRef as any));
    const { handleMouseEnter, isShowTooltip } = result.current;
    await act(() => {
      handleMouseEnter(null as any);
    });
    expect(getContainerFn).toBeCalled();
    await waitFor(() => {
      expect(getTooltipFn).toBeCalled();
    });
  });

  it('should handle mouse leave', async () => {
    const { result } = renderHook(() => useCellTooltip(mockTooltipRef as any));
    const { handleMouseLeave, isShowTooltip } = result.current;
    handleMouseLeave(null as any);
    await waitFor(() => {
      expect(isShowTooltip).toBeFalsy();
    });
  });

  it('[NEGATIVE] should return with empty refs', () => {
    const { result } = renderHook(() => useCellTooltip({current: undefined} as any));
    const { isShowTooltip, handleMouseEnter, handleMouseLeave, currentPos, tooltipStyles } =
      result.current;

    expect(isShowTooltip).toBe(false);
    expect(handleMouseEnter).toBeInstanceOf(Function);
    expect(handleMouseLeave).toBeInstanceOf(Function);
    expect(currentPos).toEqual('abl');
    expect(tooltipStyles).toEqual({ visibility: 'hidden' });
  })
});
