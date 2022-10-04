import React from 'react';
import styled from 'styled-components';

import { px, typography, colors } from 'src/styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number;
}

const StyledButton = styled.button<ButtonProps>`
  ${typography.headingSmall};
  width: ${({ width }) => (width ? px(width) : '100%')};
  border: none;
  background-color: transparent;
  color: ${colors.updPrimary};
  cursor: pointer;

  &:disabled {
    color: ${colors.updTextPrimary};
    font-weight: 400;
    cursor: default;
  }
`;

const PreviewButton = ({ children, ...props }: ButtonProps) => (
  <StyledButton {...props}>{children}</StyledButton>
);

export default PreviewButton;
