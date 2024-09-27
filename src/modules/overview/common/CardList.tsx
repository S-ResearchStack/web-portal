import React from 'react';

import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import ListOverview, { ListItem } from './ListOverview';
import OverviewCard from './OverviewCard';

export type { ListItem };

type Props = {
  title: string;
  data: ListItem[];
  detailPath?: string;
  isLoading?: boolean;
}
const CardList = ({ title, data, detailPath, isLoading }: Props) => {
  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect key="top" x="0" y="0" rx="2" width="50%" height="24" />,
        <SkeletonRect key="bottom" x="0" y="50" rx="2" width="100%" height="160" />,
      ]}
    >
      <OverviewCard
        title={title}
        detailPath={detailPath}
      >
        <ListOverview data={data} />
      </OverviewCard>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default CardList;
