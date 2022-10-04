import React, { FC, useRef } from 'react';
import styled from 'styled-components';
import Transition, {
  ENTERED,
  ENTERING,
  TransitionProps,
  TransitionStatus,
} from 'react-transition-group/Transition';
import { animation } from 'src/styles';

const ANIMATION_DURATION = 300;

export type SlideDirection = 'left' | 'right';

type ContainerProps = React.PropsWithChildren<{
  status: TransitionStatus;
  direction: SlideDirection;
}>;

type StyleAttr = { style: Partial<CSSStyleDeclaration> };

const getStateStyles = (trans: string, direction: SlideDirection): StyleAttr => ({
  style: {
    [direction]: '0',
    transform: `translateX(${trans})`,
  },
});

const Container = styled.div.attrs(({ status, direction }: ContainerProps): StyleAttr => {
  switch (direction) {
    case 'left':
      switch (status) {
        case ENTERING:
        case ENTERED:
          return getStateStyles('0%', direction);
        default:
          return getStateStyles('-100%', direction);
      }

    case 'right':
    default:
      switch (status) {
        case ENTERING:
        case ENTERED:
          return getStateStyles('0%', direction);
        default:
          return getStateStyles('100%', direction);
      }
  }
})<ContainerProps>`
  position: absolute;
  top: 0;
  bottom: 0;
  transition: transform ${ANIMATION_DURATION}ms ${animation.defaultTiming};
`;

export type SlideProps = React.PropsWithChildren<Partial<TransitionProps<HTMLDivElement>>> & {
  direction?: SlideDirection;
};

const Slide: FC<SlideProps> = ({ direction = 'right', children, ...props }) => {
  const nodeRef = useRef(null);

  return (
    <Transition {...props} nodeRef={nodeRef} timeout={ANIMATION_DURATION}>
      {(status) => (
        <Container ref={nodeRef} status={status} direction={direction}>
          {children}
        </Container>
      )}
    </Transition>
  );
};

export default Slide;
