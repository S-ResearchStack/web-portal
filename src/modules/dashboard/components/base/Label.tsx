import React from 'react';
import styled from 'styled-components';
import { px, typography } from 'src/styles';

export interface LabelProps {
  error?: boolean;
  required?: boolean;
  $disabled?: boolean;
}

const Label = styled.span<LabelProps>`
  ${typography.bodySmallSemibold};
  gap: ${px(8)};
  height: ${px(18)};
  width: fit-content;
  position: ${({ required }) =>
    (required ? "relative" : "static")};
  color: ${({ error, $disabled, theme }) =>
    (error && theme.colors.statusErrorText) ||
    ($disabled ? 'rgba(0, 0, 0, 0.38)' : theme.colors.textPrimary)};
  &::before {
    content: ${({ required }) => (required ? "'*'" : "''")};
    position: absolute;
    color: red;
    top: -2px;
    right: -10px;
  }
`;

export default Label;
