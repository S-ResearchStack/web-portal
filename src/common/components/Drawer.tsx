import React, { forwardRef, useRef } from 'react';
import BackdropOverlay from 'src/common/components/BackdropOverlay';
import styled from 'styled-components';

import { colors, px } from 'src/styles';
import Slide, { SlideDirection, SlideProps } from 'src/common/components/animations/Slide';
import combineRefs from 'src/common/utils/combineRefs';
import useDisableElasticScroll from 'src/common/useDisableElasticScroll';

interface DrawerProps
  extends React.PropsWithChildren<object>,
    Pick<SlideProps, 'onEnter' | 'onEntering' | 'onEntered' | 'onExit' | 'onExiting' | 'onExited'> {
  open: boolean;
  direction?: SlideDirection;
}

const DrawerBox = styled.div`
  height: 100%;
  z-index: 1001;
  width: ${px(840)};
  background-color: ${colors.surface};
  overflow: auto;
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
      <BackdropOverlay open={open}>
        <Slide {...slideProps} in={open} direction={direction}>
          <DrawerBox ref={combineRefs([boxRef, ref])} aria-modal={open} aria-hidden={!open}>
            {children}
          </DrawerBox>
        </Slide>
      </BackdropOverlay>
    );
  }
);

export default Drawer;
