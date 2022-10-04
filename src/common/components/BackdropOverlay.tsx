import React, { FC, useMemo, useState } from 'react';

import styled, { css } from 'styled-components';

import Portal from 'src/common/components/Portal';
import Fade, { FadeProps } from 'src/common/components/animations/Fade';
import { colors, px } from 'src/styles';

const BackdropContainer = styled.div<{ show: boolean }>`
  position: relative;
  z-index: ${({ show }) => (show ? 1000 : -1)};
`;

export const BackdropBase = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const Backdrop = styled(BackdropBase)<{ loaderBackdrop?: boolean }>`
  background-color: ${colors.backdrop};
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

export interface BackdropOverlayProps
  extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>,
    Pick<FadeProps, 'onEnter' | 'onEntering' | 'onEntered' | 'onExit' | 'onExiting' | 'onExited'> {
  open: boolean;
  loaderBackdrop?: boolean;
}

const BACKDROP_ID = 'backdrop-portal';

const createId = (id?: string): string => (id ? `${BACKDROP_ID}-${id}` : BACKDROP_ID);

const BackdropOverlay: FC<BackdropOverlayProps> = ({
  open,
  loaderBackdrop,
  children,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  onExited,
  id,
  ...props
}): JSX.Element => {
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
      <BackdropContainer show={showContent}>
        <BackdropContent loaderBackdrop={loaderBackdrop}>{children}</BackdropContent>
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
          <Backdrop {...props} loaderBackdrop={loaderBackdrop} />
        </Fade>
      </BackdropContainer>
    </Portal>
  );
};

export default BackdropOverlay;
