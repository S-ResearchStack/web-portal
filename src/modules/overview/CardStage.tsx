import React, { useMemo } from 'react';
import styled from 'styled-components';

import { px, theme } from 'src/styles';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import OverviewCard from './common/OverviewCard';

const getStageColor = (status?: string) => {
  switch (status) {
    case 'STARTED_OPEN':
      return theme.colors.secondaryGreen
    default:
      return theme.colors.disabled
  }
}
const getStageText = (status?: string) => {
  switch (status) {
    case 'STARTED_OPEN':
      return 'Ongoing'
    default:
      return '-'
  }
}

type Props = {
  title: string;
  stage?: string;
  isLoading?: boolean;
}
const CardStage = ({ title, stage, isLoading }: Props) => {
  const color = useMemo(() => getStageColor(stage), [stage]);

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect key="top" x="0" y="0" rx="2" width="50%" height="24" />,
        <SkeletonRect key="bottom" x="0" y="50" rx="2" width="100%" height="70" />,
      ]}
    >
      <OverviewCard
        title={title}
        titleTooltip=''
      >
        <Content>
          <StatusCircle color={color} />
          <StatusText>{getStageText(stage)}</StatusText>
        </Content>
      </OverviewCard>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default CardStage;

const Content = styled.div`
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: flex-start;
`
const StatusCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 100rem;
  background-color: ${props => props.color};
`
const StatusText = styled.span`
  font-weight: 600;
  font-size: ${px(45)};
  color: ${theme.colors.textPrimary};
`
