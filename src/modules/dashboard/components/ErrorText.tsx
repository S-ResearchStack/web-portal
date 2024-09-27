import React from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';

type ErrorTextProps = {
  title: string;
  description?: string;
};
const ErrorText = ({ title, description }: ErrorTextProps) => {
  return (
    <ErrorTextContainer>
      <TitleText>
        {title}
      </TitleText>
      <DescriptionText>
        {description}
      </DescriptionText>
    </ErrorTextContainer>
  );
};

export default ErrorText;

const ErrorTextContainer = styled.div`
  height: 100%;
  min-height: ${px(252)};
  min-width: ${px(252)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const TitleText = styled.div`
  font-weight: bold;
`;
const DescriptionText = styled.div`
  text-align: center;
`;
