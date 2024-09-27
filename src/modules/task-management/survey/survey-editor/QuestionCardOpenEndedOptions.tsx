import React, { FC } from 'react';

import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';
import TextArea from 'src/common/components/TextArea';

const OptionsContainer = styled.div`
  display: flex;
`;

export const StyledTextarea = styled(TextArea)`
  background-color: ${colors.primaryWhite} !important;
  border-color: ${colors.primary10} !important;
  height: ${px(72)};
  padding-top: ${px(8)};

  &::placeholder {
    ${typography.bodySmallRegular};
    color: ${colors.textPrimary} !important;
    opacity: 0.7;
  }
`;

const QuestionCardOpenEndedOptions: FC = () => (
  <OptionsContainer>
    <StyledTextarea disabled placeholder="Max 500 characters" />
  </OptionsContainer>
);

export default QuestionCardOpenEndedOptions;
