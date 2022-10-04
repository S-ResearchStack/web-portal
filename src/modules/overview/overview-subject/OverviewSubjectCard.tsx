import React from 'react';
import styled from 'styled-components';

import Card from 'src/common/components/Card';
import { colors, px, typography } from 'src/styles';

const SubjectCard = styled(Card)`
  height: ${px(252)};
`;

const Content = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: ${px(40)};
  gap: ${px(10)};
`;

const Value = styled.span`
  ${typography.headingXXLargeSemibold};
  color: ${colors.updPrimary};
  margin-bottom: ${px(8)};
`;

const Measure = styled.span`
  ${typography.headingLargeSemibold};
  color: ${colors.updTextSecondaryGray};
  margin-top: ${px(12)};
`;

type OverviewSubjectCardProps = {
  values: [string, string][];
  cardTitle: string;
};

const OverviewSubjectCard = ({ values, cardTitle }: OverviewSubjectCardProps) => (
  <SubjectCard title={cardTitle} empty={!values.length}>
    <Content>
      {values.map(([v, unit], idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`${idx}-${unit}`}>
          <Value>{v}</Value>
          <Measure>{unit}</Measure>
        </React.Fragment>
      ))}
    </Content>
  </SubjectCard>
);

export default OverviewSubjectCard;
