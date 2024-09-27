import React, { FC, ReactElement, useMemo, useState } from 'react';

import styled, { css } from 'styled-components';

import { colors, px } from 'src/styles';

import Fade, { FadeProps } from './animations/Fade';
import Portal from './Portal';

const BackdropContainer = styled.div<{ show?: boolean }>`
  position: relative;
  z-index: ${({ show }) => (show ? 1000 : -1)};
`;

const BackdropBase = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const Backdrop = styled(BackdropBase)<{ loaderBackdrop?: boolean }>`
  background-color: ${colors.black40};
  ${({ loaderBackdrop }) =>
    loaderBackdrop &&
    css`
      background-color: ${colors.background};
      opacity: 0.7;
    `}
`;

const BackdropContent = styled(BackdropBase)<{ loaderBackdrop?: boolean }>`
  z-index: 1001;
  ${({ loaderBackdrop }) =>
    loaderBackdrop &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(${px(5)});
    `}
`;

type NecessaryFadeProps =
  | 'onEnter'
  | 'onEntering'
  | 'onEntered'
  | 'onExit'
  | 'onExiting'
  | 'onExited';

export interface BackdropOverlayProps
  extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>,
    Pick<FadeProps, NecessaryFadeProps> {
  open?: boolean;
  blur?: boolean;
}

const BACKDROP_ID = 'backdrop-portal';

const createId = (id?: string): string => (id ? `${BACKDROP_ID}-${id}` : BACKDROP_ID);

const BackdropOverlay: FC<BackdropOverlayProps> = ({
  open,
  blur,
  children,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  onExited,
  id,
  ...props
}): ReactElement => {
  const [showContent, setShowContent] = useState(open);

  const fadeProps = {
    onEnter,
    onEntered,
    onExit,
    onExiting,
  };

  const portalId = useMemo(() => createId(id), [id]);

  return (
    <Portal id={portalId} enabled>
      <BackdropContainer show={showContent} data-testid="backdrop-container">
        <BackdropContent loaderBackdrop={blur} data-testid="backdrop-content">
          {children}
        </BackdropContent>
        <Fade
          {...fadeProps}
          in={open}
          appear
          onEntering={(isAppearing: boolean) => {
            onEntering?.(isAppearing);
            setShowContent(true);
          }}
          onExited={() => {
            onExited?.();
            setShowContent(false);
          }}
        >
          <Backdrop {...props} loaderBackdrop={blur} data-testid="backdrop" />
        </Fade>
      </BackdropContainer>
    </Portal>
  );
};

export default BackdropOverlay;
