import React, { useLayoutEffect, useRef, useState, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useResizeDetector } from 'react-resize-detector';
import useTimeoutFn from 'react-use/lib/useTimeoutFn';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useHoverDirty from 'react-use/lib/useHoverDirty';
import SimpleGrid from 'src/common/components/SimpleGrid';

import { animation, px } from 'src/styles';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import Portal from 'src/common/components/Portal';

import { currentSnackbarSelector, snackbarActionTriggered } from './snackbar.slice';
import Snackbar from './Snackbar';

const TRANSITION_DURATION_MS = 300;

const Anchor = styled.div<{ extraWidth?: number; visible?: boolean }>`
  position: fixed;
  bottom: 0;
  justify-content: center;
  display: flex;
  transition: all ${TRANSITION_DURATION_MS}ms ${animation.defaultTiming};
  transition-property: opacity, transform;
  width: ${({ extraWidth }) => extraWidth && `calc(100% - ${px(extraWidth)})`};

  ${({ visible }) =>
    visible
      ? css`
          opacity: 1;
          transform: translateY(-24px);
        `
      : css`
          opacity: 0;
          transform: translateY(100%);
        `}

  pointer-events: none;
  > * {
    pointer-events: all;
  }
`;

const PositionTracker = styled.div`
  position: relative;
  height: 0;
  width: 100%;
  pointer-events: none;
`;

const SnackbarContainer = (props: {
  className?: string;
  mainContainerRef?: React.RefObject<HTMLDivElement>;
  useSimpleGrid?: boolean;
}) => {
  const { width: trackerWidth, ref: sizeTrackerRef } = useResizeDetector<HTMLDivElement>({
    handleHeight: false,
  });
  const anchorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (sizeTrackerRef.current && anchorRef.current) {
      const { left, width } = sizeTrackerRef.current.getBoundingClientRect();
      anchorRef.current.style.left = `${left}px`;
      anchorRef.current.style.width = `${width}px`;
    }
  }, [trackerWidth, sizeTrackerRef]);

  const { mainContainerRef, useSimpleGrid } = props;

  const pendingSnackbar = useAppSelector(currentSnackbarSelector);

  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<typeof pendingSnackbar>();
  const isSnackbarHovered = useHoverDirty(anchorRef);

  const showPending = () => {
    setSnackbar(pendingSnackbar);
    setSnackbarVisible(!!pendingSnackbar);
  };

  const [, , showPendingAfterTransition] = useTimeoutFn(showPending, TRANSITION_DURATION_MS);

  const hideCurrentAndShowPending = useCallback(() => {
    setSnackbarVisible(false);
    showPendingAfterTransition();
  }, [showPendingAfterTransition]);

  const extraWidth = useMemo(() => {
    const sidebar = document.getElementById('sidebar')?.getBoundingClientRect();
    const sidebarWidth = sidebar?.width || 0;
    const scrollWidth =
      mainContainerRef && mainContainerRef.current
        ? mainContainerRef.current.offsetWidth - mainContainerRef.current.clientWidth
        : 0;

    return sidebarWidth + scrollWidth;
  }, [mainContainerRef]);

  useUpdateEffect(() => {
    if (pendingSnackbar === snackbar) {
      return;
    }

    if (!snackbar) {
      showPending();
    } else if (!isSnackbarHovered) {
      hideCurrentAndShowPending();
    }
  }, [pendingSnackbar, isSnackbarHovered]);

  const dispatch = useAppDispatch();

  const snackBar = useMemo(
    () => (
      <Snackbar
        text={snackbar?.text || ''}
        actionLabel={snackbar?.actionLabel}
        onAction={() => {
          // For some reason mouseout event is not fired when element is moved out by transition
          // causing isSnackbarHovered to be stuck at 'true'.
          anchorRef.current?.dispatchEvent(new Event('mouseout'));

          hideCurrentAndShowPending();
          if (snackbar?.id) {
            dispatch(snackbarActionTriggered(snackbar.id));
          }
        }}
      />
    ),
    [dispatch, hideCurrentAndShowPending, snackbar]
  );

  const wrappedSnackbar = useMemo(
    () => (useSimpleGrid ? <SimpleGrid>{snackBar}</SimpleGrid> : snackBar),
    [snackBar, useSimpleGrid]
  );

  return (
    <>
      <PositionTracker ref={sizeTrackerRef} {...props} />
      <Portal id="snackbar-portal" enabled={!!snackbar}>
        <Anchor
          ref={anchorRef}
          visible={isSnackbarVisible}
          extraWidth={useSimpleGrid ? extraWidth : 0}
        >
          {wrappedSnackbar}
        </Anchor>
      </Portal>
    </>
  );
};

export default SnackbarContainer;
