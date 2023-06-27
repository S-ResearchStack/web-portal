import React, { useLayoutEffect, useRef, useState, useMemo, useCallback, useContext } from 'react';
import styled, { css } from 'styled-components';
import { useResizeDetector } from 'react-resize-detector';
import useTimeoutFn from 'react-use/lib/useTimeoutFn';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useHoverDirty from 'react-use/lib/useHoverDirty';
import _isEqual from 'lodash/isEqual';

import SimpleGrid from 'src/common/components/SimpleGrid';
import { animation, px } from 'src/styles';
import { useAppDispatch, useAppSelector } from 'src/modules/store';
import Portal from 'src/common/components/Portal';
import { ModalContext } from 'src/common/components/Modal';

import { currentSnackbarSelector, snackbarActionTriggered } from './snackbar.slice';
import Snackbar from './Snackbar';

export const TRANSITION_DURATION_MS = 300;

const Anchor = styled.div<{ extraWidth?: number; visible?: boolean }>`
  position: fixed;
  bottom: 0;
  justify-content: center;
  display: flex;
  transition: all ${TRANSITION_DURATION_MS}ms ${animation.defaultTiming};
  transition-property: opacity, transform;
  z-index: 1000;

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

const SnackbarContainer = (props: { className?: string; useSimpleGrid?: boolean }) => {
  const { width: trackerWidth, ref: sizeTrackerRef } = useResizeDetector<HTMLDivElement>({
    handleHeight: false,
  });
  const anchorRef = useRef<HTMLDivElement>(null);

  const { useSimpleGrid } = props;

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

  useUpdateEffect(() => {
    if (_isEqual(pendingSnackbar, snackbar)) {
      return;
    }

    if (!snackbar) {
      showPending();
    } else if (!isSnackbarHovered) {
      hideCurrentAndShowPending();
    }
  }, [pendingSnackbar, isSnackbarHovered]);

  const dispatch = useAppDispatch();

  const isModalOpened = !!useContext(ModalContext).openedCount;

  useLayoutEffect(() => {
    if (sizeTrackerRef.current && anchorRef.current) {
      const { left, width } = sizeTrackerRef.current.getBoundingClientRect();

      anchorRef.current.style.left = isModalOpened ? `calc(50% - ${px(width / 2)})` : px(left);
      anchorRef.current.style.width = `${width}px`;
    }
  }, [trackerWidth, sizeTrackerRef, snackbar, isModalOpened]);

  const snackbarElement = useMemo(() => {
    const baseItem = (
      <Snackbar
        key={snackbar?.id}
        text={snackbar?.text || ''}
        actionLabel={snackbar?.actionLabel}
        onAction={() => {
          // For some reason mouseout event is not fired when element is moved out by transition
          // causing isSnackbarHovered to be stuck at 'true'.
          anchorRef.current?.dispatchEvent(new Event('mouseout'));

          if (snackbar?.id) {
            dispatch(snackbarActionTriggered(snackbar.id));
          }
        }}
        onClose={() => setSnackbarVisible(false)}
        showCloseIcon={snackbar?.showCloseIcon}
        showErrorIcon={snackbar?.showErrorIcon}
        showSuccessIcon={snackbar?.showSuccessIcon}
      />
    );
    if (useSimpleGrid) {
      return <SimpleGrid>{baseItem}</SimpleGrid>;
    }
    return baseItem;
  }, [dispatch, snackbar, useSimpleGrid]);

  return (
    <>
      <PositionTracker ref={sizeTrackerRef} {...props} />
      <Portal id="snackbar-portal" enabled={!!snackbar}>
        <Anchor ref={anchorRef} visible={isSnackbarVisible}>
          {snackbarElement}
        </Anchor>
      </Portal>
    </>
  );
};

export default SnackbarContainer;
