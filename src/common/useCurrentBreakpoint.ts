import { useCallback, useState } from 'react';
import useEvent from 'react-use/lib/useEvent';

export type Breakpoint = {
  width: number;
  gutter: number;
  margins: number;
  totalColumns: number;
};

const breakpoints: Readonly<Readonly<Breakpoint>[]> = [
  {
    width: 768,
    gutter: 16,
    margins: 24,
    totalColumns: 8,
  },
  {
    width: 840,
    gutter: 16,
    margins: 24,
    totalColumns: 8,
  },
  {
    width: 1024,
    gutter: 24,
    margins: 32,
    totalColumns: 12,
  },
  ...[1280, 1440, 1600, 1920].map((width) => ({
    width,
    gutter: 24,
    margins: 56,
    totalColumns: 12,
  })),
];

const getBreakpointIdx = (screenWidth: number) => {
  for (let idx = breakpoints.length - 1; idx >= 0; idx -= 1) {
    const { width } = breakpoints[idx];
    if (screenWidth >= width) {
      return idx;
    }
  }
  return 0;
};

const useCurrentBreakpoint = () => {
  const [breakpointIdx, setBreakpointIdx] = useState(getBreakpointIdx(window.innerWidth));

  const onResize = useCallback(() => {
    const newBreakpointIdx = getBreakpointIdx(window.innerWidth);
    if (newBreakpointIdx !== breakpointIdx) {
      setBreakpointIdx(newBreakpointIdx);
    }
  }, [breakpointIdx]);

  useEvent('resize', onResize, window);

  return breakpoints[breakpointIdx];
};

export default useCurrentBreakpoint;
