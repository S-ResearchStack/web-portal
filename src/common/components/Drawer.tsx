import React, { forwardRef, useRef } from 'react';
import BackdropOverlay from 'src/common/components/BackdropOverlay';

import styled from 'styled-components';

import { colors, px } from 'src/styles';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import Slide, { SlideDirection, SlideProps } from 'src/common/components/animations/Slide';
import combineRefs from 'src/common/utils/combineRefs';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';

type NecessaryDrawerProps =
  | 'onEnter'
  | 'onEntering'
  | 'onEntered'
  | 'onExit'
  | 'onExiting'
  | 'onExited';

interface DrawerProps
  extends React.PropsWithChildren<object>,
    Pick<SlideProps, NecessaryDrawerProps> {
  open: boolean;
  direction?: SlideDirection;
  width?: number;
}

const DrawerBox = withCustomScrollBar(styled.div<{ $width: number }>`
  width: ${({ $width }) => px($width)};
`)`
  height: 100%;
  z-index: 1001;
  background-color: ${colors.surface};
  overflow: auto;
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      direction,
      children,

      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited,
      width = 840,
    },
    ref
  ) => {
    const boxRef = useRef<HTMLDivElement>(null);

    const slideProps = {
      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited,
    };

    useDisableElasticScroll(boxRef);

    return (
      <BackdropOverlay open={Boolean(open)}>
        <Slide {...slideProps} in={Boolean(open)} direction={direction}>
          <DrawerBox
            role="alertdialog"
            ref={combineRefs([boxRef, ref])}
            aria-modal={open}
            aria-hidden={!open}
            data-testid="drawer-box"
            $width={width}
          >
            {children}
          </DrawerBox>
        </Slide>
      </BackdropOverlay>
    );
  }
);

export default Drawer;
