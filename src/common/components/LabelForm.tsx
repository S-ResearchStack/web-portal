import React, { FC } from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

interface BlockStatus {
  required?: boolean;
  error?: boolean;
}

const InputDescription = styled.span<BlockStatus>`
  ${typography.bodySmallSemibold};
  gap: ${px(8)};
  height: ${px(18)};
  width: fit-content;
  position: ${({ required }) => (required ? "relative" : "static")};
  color: ${({ error }) => (error ? colors.statusErrorText : colors.textPrimary)};
  &::before {
    content: ${({ required }) => (required ? "'*'" : "''")};
    position: absolute;
    color: red;
    top: -2px;
    right: -10px;
  }
`;

interface LabelFormProps {
  label?: String;
  required?: boolean;
  error?: boolean;
}
const LabelForm: FC<LabelFormProps> = ({ label, required, error }) => (
  <InputDescription required={required} error={error}>
    {label}
  </InputDescription>
);
export default LabelForm;
