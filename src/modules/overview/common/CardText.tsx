import React from 'react';
import styled from 'styled-components';

import { px, theme } from 'src/styles';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import OverviewCard from './OverviewCard';

type Props = {
  title: string;
  titleTooltip?: string;
  text?: string;
  isLoading?: boolean;
}
const CardText = ({ title, titleTooltip, text, isLoading }: Props) => {
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
        titleTooltip={titleTooltip}
      >
        <Text>
          {text || '-'}
        </Text>
      </OverviewCard>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default CardText;

const Text = styled.span`
  font-weight: 600;
  font-size: ${px(45)};
  color: ${theme.colors.textPrimary};
`
