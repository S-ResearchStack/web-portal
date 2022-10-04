import React from 'react';
import styled from 'styled-components';

import { px, typography, colors, boxShadow } from 'src/styles';

const Container = styled.div`
  padding: ${px(24)};
  height: ${px(160)};
  background-color: ${colors.updPrimaryWhite};
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  margin-bottom: ${px(24)};
`;

const Title = styled.div`
  ${typography.headingXSmall};
  color: ${colors.updTextPrimaryDark};
  margin-bottom: ${px(25)};
`;

type SurveyAnalyticsCardProps = {
  title: string;
  children: React.ReactNode;
};

const SurveyAnalyticsCard = ({ title, children }: SurveyAnalyticsCardProps) => (
  <Container>
    <Title>{title}</Title>
    {children}
  </Container>
);

export default SurveyAnalyticsCard;
