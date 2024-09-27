import React, { ReactElement } from 'react';

import styled from 'styled-components';

import { px, typography } from 'src/styles';

interface ResultMessageProps {
  picture: ReactElement;
  title: ReactElement | string;
  description: ReactElement | string;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: ${px(300)};
  justify-content: center;
  > * {
    text-align: center;
  }
`;

const Picture = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${px(112)};
  height: ${px(112)};
  margin-top: ${px(-8)};
`;

const Title = styled.h2`
  ${typography.headingSmall};
  margin: 0;
  margin-top: ${px(24)};
`;

const Description = styled.p`
  ${typography.bodyXSmallRegular};
  max-width: ${px(600)};
  margin: 0;
  margin-top: ${px(16)};
  strong {
    ${typography.bodyMediumSemibold};
  }
`;

const EmptyList: React.FC<ResultMessageProps> = ({ picture, title, description }) => (
  <Content data-testid="empty-list">
    <Picture>{picture}</Picture>
    <Title>{title}</Title>
    <Description>{description}</Description>
  </Content>
);

export default EmptyList;
