import React from 'react';
import styled, { css } from 'styled-components';
import { boxShadow, colors, px } from 'src/styles';

const StyledCard = styled.div<ScreenCenteredCardProps>`
  color: ${colors.textPrimary};
  ${({ minWidth, width, ratio }) => {
    const height = width * ratio;
    const minHeight = minWidth * ratio;
    return css`
      min-width: ${px(minWidth)};
      width: ${width}vw;
      min-height: ${px(minHeight)};
      height: ${height}vw;
    `;
  }};
  max-height: 90vh;
  display: flex;
  margin: auto;
  background-color: ${colors.surface};
  box-shadow: ${boxShadow.card};
  border-radius: ${px(4)};
  flex-shrink: 0;
`;

type ScreenCenteredCardProps = {
  minWidth: number;
  width: number;
  ratio: number;
  children: JSX.Element;
  onMainButtonClick?: () => void;
};

const ScreenCenteredCard = ({ children, onMainButtonClick, ...rest }: ScreenCenteredCardProps) => (
  <StyledCard {...rest}>{children}</StyledCard>
);

export default ScreenCenteredCard;
