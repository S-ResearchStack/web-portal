import React from 'react';
import styled from 'styled-components';

import { px, typography, colors, boxShadow } from 'src/styles';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';

const Container = styled.div`
  padding: ${px(24)};
  height: ${px(160)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  box-shadow: ${boxShadow.card};
  margin-bottom: ${px(24)};
`;

const Title = styled.div`
  ${typography.headingXSmall};
  color: ${colors.textPrimaryDark};
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

const SkeletonContainer = styled(SkeletonLoading)`
  margin-top: ${px(8)};
`;

export const SurveyAnalyticsCardLoading = () => (
  <Container>
    <SkeletonContainer>
      <SkeletonRect x="0" y="0" rx="4" width="180" height="24" />
      <SkeletonRect x="0" y="48" rx="4" width="132" height="56" />
    </SkeletonContainer>
  </Container>
);
