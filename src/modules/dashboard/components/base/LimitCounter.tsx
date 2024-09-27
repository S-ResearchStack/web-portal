import React from 'react';

import styled, { css } from 'styled-components';

import { colors, px, typography } from 'src/styles';

interface LimitsCounterProps extends React.PropsWithChildren {
  current: number;
  max: number;
  inner?: boolean;
}

const LimitsCounterContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const LimitsCounterValues = styled.div<{ inner?: boolean }>`
  color: ${colors.textSecondaryGray};

  ${(p) =>
    p.inner
      ? css`
          ${typography.labelRegular};
          position: absolute;
          bottom: ${px(1)};
          right: ${px(8)};
        `
      : css`
          ${typography.smallLabelRegular};
          margin-top: ${px(3)};
          align-self: flex-end;
        `}
`;

const LimitsCounter: React.FC<LimitsCounterProps> = ({ current, max, inner, children }) => (
  <LimitsCounterContainer>
    {children}
    <LimitsCounterValues inner={inner}>{`${current} / ${max}`}</LimitsCounterValues>
  </LimitsCounterContainer>
);

export default LimitsCounter;
