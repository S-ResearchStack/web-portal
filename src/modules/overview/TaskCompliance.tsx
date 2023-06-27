import React, { useEffect, useMemo, useRef, useState } from 'react';
import useScrolling from 'react-use/lib/useScrolling';

import _round from 'lodash/round';
import styled from 'styled-components';

import { TaskType } from 'src/modules/api';
import RankIcon from 'src/assets/icons/rank.svg';
import SortAscIcon from 'src/assets/icons/sort_asc.svg';
import SortDescIcon from 'src/assets/icons/sort_dsc.svg';
import { withCustomScrollBar } from 'src/common/components/CustomScrollbar';
import ProgressBar from 'src/common/components/ProgressBar';
import Card, { Title } from 'src/common/components/Card';
import OverviewCardWrapperWithSkeleton from 'src/common/components/OverviewCardWrapperWithSkeleton';
import { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { TaskWithProgress, useTaskComplianceData } from 'src/modules/overview/taskCompliance.slice';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { px, typography, colors, theme } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';

const taskMap: Array<{ type: TaskType; color: SpecColorType }> = [
  { type: 'survey', color: 'secondaryTangerine' },
  { type: 'activity', color: 'secondaryViolet' },
];

const TaskComplianceCard = styled(Card)`
  height: ${px(528)};
  min-height: ${px(528)};
  color: ${colors.textPrimary} !important;
  & ${Title} {
    height: ${px(24)};
    margin-bottom: ${px(45)};
  }
`;

const SortButton = styled.button`
  width: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  &:disabled {
    cursor: default;
    svg {
      path {
        fill: ${colors.disabled};
      }
    }
  }
`;

const BodyContainer = withCustomScrollBar(styled.div<{ rightPadding: boolean }>`
  width: 100%;
  max-height: ${px(359)};
  height: ${px(359)};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  row-gap: ${px(8)};
  padding-right: ${({ rightPadding }) => rightPadding && px(12)};
`)``;

const Footer = styled.div`
  width: 100%;
  height: ${px(24)};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  column-gap: ${px(18)};
  margin-top: ${px(36)};
`;

const LegendItem = styled.div`
  ${typography.bodySmallRegular};
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: ${px(2)};
  line-height: ${px(21)};
`;

const Circle = styled.div<{ $color: SpecColorType }>`
  width: ${px(20)};
  height: ${px(20)};
  background-color: ${({ $color }) => colors[$color]};
  border-radius: 50%;
  margin-right: ${px(10)};
`;

const EmptyScreen = styled.div`
  max-height: ${px(359)};
  height: ${px(359)};
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.background};
  ${typography.headingXMediumRegular};
`;

const Legend = ({ color, type }: { color: SpecColorType; type: string }) => (
  <LegendItem key={type}>
    <Circle $color={color} />
    {type[0].toUpperCase() + type.slice(1)} tasks
  </LegendItem>
);

const Empty = () => <EmptyScreen>No data yet</EmptyScreen>;

const TaskCompliance: React.FC = () => {
  const studyId = useSelectedStudyId();
  const { data, isLoading, error, refetch } = useTaskComplianceData({
    fetchArgs: !!studyId && { studyId },
    refetchSilentlyOnMount: true,
  });

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedData, setSortedData] = useState<TaskWithProgress[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const isContentScrolling = useScrolling(ref);

  useEffect(() => {
    if (data && data?.length) {
      setSortedData(
        [...data]?.sort((t1, t2) =>
          sortDirection === 'asc' ? t2.progress - t1.progress : t1.progress - t2.progress
        )
      );
    } else {
      setSortedData([]);
    }
  }, [data, sortDirection]);

  const extra = useMemo(
    () => (
      <SortButton
        data-testid="sort-button"
        disabled={
          !sortedData ||
          (sortedData && sortedData?.length <= 1) ||
          (!isLoading && (!data || !data?.length))
        }
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
      >
        {sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
        <RankIcon />
      </SortButton>
    ),
    [sortedData, setSortDirection, sortDirection, data, isLoading]
  );

  const content = useMemo(
    () =>
      sortedData?.map((t) => (
        <ProgressBar
          key={[t.id, t.type].join('-')}
          responded={t.responded || 0}
          name={t.title || ''}
          description={t.description}
          total={t.total || 1}
          percent={_round(t.progress * 100, 1)}
          color={taskMap.find(({ type }) => type === t.type)?.color || 'primaryLight'}
          isContentScrolling={isContentScrolling}
          tooltipContent={['Number of respondents', 'Completion percentage']}
          marginBottom={8}
        />
      )),
    [sortedData, isContentScrolling]
  );

  return (
    <OverviewCardWrapperWithSkeleton
      isLoading={isLoading}
      skeletons={[
        <SkeletonRect key="top" x="0" y="0" rx="2" width="63.5%" height="24" />,
        <SkeletonRect key="bottom" x="0" y="451" rx="2" width="100%" height="24" />,
      ]}
    >
      <TaskComplianceCard title="Task compliance" onReload={refetch} error={!!error} action={extra}>
        {!isLoading && (!data || !data?.length) ? (
          <Empty />
        ) : (
          <BodyContainer
            ref={ref}
            rightPadding={(sortedData?.length || 0) > 5}
            scrollbarTrackColor={theme.colors.surface}
          >
            {content}
          </BodyContainer>
        )}
        <Footer>
          {taskMap.map((t) => (
            <Legend key={t.type} color={t.color} type={t.type} />
          ))}
        </Footer>
      </TaskComplianceCard>
    </OverviewCardWrapperWithSkeleton>
  );
};

export default TaskCompliance;
