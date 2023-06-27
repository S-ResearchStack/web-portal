import styled, { css } from 'styled-components';

import { colors } from 'src/styles';

export const CarouselWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: ${colors.primaryDisabled};

  > :nth-child(2) {
    color: ${colors.textPrimaryBlue};
  }
`;

export const CarouselItemWrapper = styled.div<{ $nonClickable?: boolean }>`
  flex: 1;
  display: flex;
  justify-content: center;
  cursor: pointer;

  ${({ $nonClickable }) =>
    $nonClickable &&
    css`
      pointer-events: none;
      cursor: default;
    `};
`;

export const handleAddBase = (v: number, delta: number, base: number) =>
  (v + (delta % base) + base) % base;
