import React, { FC } from 'react';
import styled from 'styled-components';

import { colors, px, typography } from 'src/styles';

export const FormSection = styled.div`
  display: flex;
  gap: ${px(8)};
`;

const FormContainer = styled.div`
  display: flex;
  margin: ${px(16)} 0;

  ${FormSection} {
    margin: ${px(16)} 0;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const FormLabel = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimary};
  flex: 0 0 ${px(193)};
`;

const FormContent = styled.div`
  flex: 1;
`;

const Form = styled.div``;

interface FormBlockProps extends React.PropsWithChildren {
  label: string;
}

export const FormBlock: FC<FormBlockProps> = ({ children, label }) => (
  <FormContainer>
    <FormLabel>{label}</FormLabel>
    <FormContent>{children}</FormContent>
  </FormContainer>
);

export default Form;
