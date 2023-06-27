import React, { FC } from 'react';
import styled, { keyframes } from 'styled-components';

import { animation, colors, px } from 'src/styles';

const lineLoaderAnimation = keyframes`
  0% {
    width: 0;
    transform: translateX(0%);
  }
  7% {
    width: 10%;
    transform: translateX(0%);
  }
  40% {
    width: 60%;
  }
  50% {
    transform: translateX(85%);
  }
  75% {
    width: 100%;
  }
  100% {
    transform: translateX(100%);
  }
`;

const LineLoaderRunner = styled.div`
  height: ${px(2)};
  background: ${colors.primary};
`;

const LineLoaderContainer = styled.div`
  width: 100%;
  height: ${px(1)};
  background: ${colors.primaryDisabled};
  overflow: hidden;

  ${LineLoaderRunner} {
    animation: 1.7s infinite ${lineLoaderAnimation} ${animation.defaultTiming};
  }
`;

const LineLoader: FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <LineLoaderContainer {...props} data-testid="line-loader">
    <LineLoaderRunner data-testid="runner" />
  </LineLoaderContainer>
);

export default LineLoader;
