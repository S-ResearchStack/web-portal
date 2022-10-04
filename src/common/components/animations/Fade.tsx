import React, { FC, useRef } from 'react';
import Transition, {
  ENTERED,
  ENTERING,
  TransitionProps,
  TransitionStatus,
} from 'react-transition-group/Transition';
import styled from 'styled-components';

import { animation } from 'src/styles';

const ANIMATION_DURATION = 300;

type StyleAttr = { style: Partial<CSSStyleDeclaration> };

const getStateStyles = (opacity: string, display = 'block'): StyleAttr => ({
  style: { opacity, display },
});

type ContainerProps = { status: TransitionStatus };

const Container = styled.div.attrs(({ status }: ContainerProps): StyleAttr => {
  switch (status) {
    case ENTERING:
    case ENTERED:
      return getStateStyles('1');
    default:
      return getStateStyles('0');
  }
})`
  display: none;
  opacity: 0;
  transition: opacity ${ANIMATION_DURATION}ms ${animation.defaultTiming};
`;

export type FadeProps = React.PropsWithChildren<Partial<TransitionProps<HTMLDivElement>>>;

const Fade: FC<FadeProps> = ({ children, ...props }) => {
  const nodeRef = useRef(null);

  return (
    <Transition {...props} nodeRef={nodeRef} timeout={ANIMATION_DURATION}>
      {(status) => (
        <Container ref={nodeRef} status={status}>
          {children}
        </Container>
      )}
    </Transition>
  );
};

export default Fade;
