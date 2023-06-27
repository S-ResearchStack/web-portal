import React, { useCallback, useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';
import _clamp from 'lodash/clamp';

const FPS = 60; // default fps for animation frame

let prevScrollTop = 0;
let prevScrollClearTimer = -1;

const setTemporaryNextScrollTop = (value: number) => {
  prevScrollTop = value;
  prevScrollClearTimer = window.setTimeout(() => {
    prevScrollTop = 0;
  }, (1_000 / FPS) * 2);
};

const resetNextScrollTopTimeout = () => clearTimeout(prevScrollClearTimer);

const calcScrollOffsetPerFrame = (maxSpeed: number, fraction: number) =>
  Math.ceil((maxSpeed / FPS) * fraction);

type ScrollParams = {
  element: HTMLElement | null;
  maxSpeed: number;
  fraction: number;
};

const scrollDown = ({ element, maxSpeed, fraction }: ScrollParams) => {
  if (!element) return;

  resetNextScrollTopTimeout();

  const offset = calcScrollOffsetPerFrame(maxSpeed, fraction);
  // FIXME: 'element.scrollTop' can spontaneously reset to zero
  const scrollTop = Math.max(
    0,
    element.scrollTop + offset < prevScrollTop ? prevScrollTop : element.scrollTop
  );
  const nextScrollTop = scrollTop + offset;

  element.scroll({ top: nextScrollTop });
  setTemporaryNextScrollTop(nextScrollTop);
};

const scrollUp = ({ element, maxSpeed, fraction }: ScrollParams) => {
  if (!element) return;

  resetNextScrollTopTimeout();

  const offset = calcScrollOffsetPerFrame(maxSpeed, fraction);
  // FIXME: 'element.scrollTop' can spontaneously reset to zero
  const scrollTop = Math.max(
    0,
    element.scrollTop < prevScrollTop - offset ? prevScrollTop : element.scrollTop
  );
  const nextScrollTop = scrollTop - offset;

  if (nextScrollTop >= 0) {
    element.scroll({ top: nextScrollTop });
  }

  setTemporaryNextScrollTop(nextScrollTop);
};

let lastMouseClientY = 0;

const addMouseListener = () => {
  window.addEventListener('mousemove', (e) => {
    lastMouseClientY = e.clientY;
  });
};

addMouseListener();

const defaultParams = {
  maxSpeed: 1000,
  scrollRegionHeight: 200,
  scrollRegionOffset: 0,
};

export type UseAutoScrollParams = {
  active: boolean;
  scrollContainer: React.RefObject<HTMLElement>;
  intersectionContainer?: React.RefObject<HTMLElement>;
  maxSpeed?: number;
  scrollRegionHeight?: number;
  scrollRegionOffsetTop?: number;
  scrollRegionOffsetBottom?: number;
};

export const useAutoScroll = ({
  active,
  scrollContainer,
  intersectionContainer,
  maxSpeed = defaultParams.maxSpeed,
  scrollRegionHeight = defaultParams.scrollRegionHeight,
  scrollRegionOffsetTop = defaultParams.scrollRegionOffset,
  scrollRegionOffsetBottom = defaultParams.scrollRegionOffset,
}: UseAutoScrollParams) => {
  const intersection = useIntersection(intersectionContainer ?? React.createRef(), {
    root: scrollContainer.current,
    rootMargin: '-16px',
    threshold: 1,
  });

  const animationFrameRef = useRef(-1);

  const smoothScroll = useCallback(() => {
    if (active && (intersection ? intersection.intersectionRatio < 1 : true)) {
      if (scrollContainer.current) {
        const { height, y } = scrollContainer.current.getBoundingClientRect();

        const offsetTop = scrollRegionOffsetTop ?? 0;
        const offsetBottom = scrollRegionOffsetBottom ?? 0;

        const topEdge = y + offsetTop;
        const bottomEdge = y + height - offsetBottom;

        const commonScrollParams = {
          element: scrollContainer.current,
          maxSpeed,
        };

        if (lastMouseClientY > bottomEdge - scrollRegionHeight) {
          const fraction = 1 - (bottomEdge - lastMouseClientY) / scrollRegionHeight;

          scrollDown({
            ...commonScrollParams,
            fraction: _clamp(fraction, 0, 1),
          });
        } else if (lastMouseClientY < topEdge + scrollRegionHeight) {
          const fraction = 1 - (lastMouseClientY - topEdge) / scrollRegionHeight;

          scrollUp({
            ...commonScrollParams,
            fraction: _clamp(fraction, 0, 1),
          });
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(smoothScroll);
    }
  }, [
    active,
    intersection,
    maxSpeed,
    scrollContainer,
    scrollRegionHeight,
    scrollRegionOffsetBottom,
    scrollRegionOffsetTop,
  ]);

  useEffect(() => {
    smoothScroll();
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [smoothScroll]);
};
