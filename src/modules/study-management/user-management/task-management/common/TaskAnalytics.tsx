import React, { useMemo } from 'react';

import _sumBy from 'lodash/sumBy';
import { Duration } from 'luxon';
import styled from 'styled-components';

import Card from 'src/common/components/Card';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import SimpleGrid from 'src/common/components/SimpleGrid';
import DonutChart from 'src/modules/charts/DonutChart';
import PieChart from 'src/modules/charts/PieChart';
import { colors, px, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import { TaskType } from 'src/modules/api/models/tasks';
import OverviewLegendWrapper from 'src/modules/overview/OverviewLegendWrapper';
import TaskAnalyticsCard, { TaskAnalyticsCardLoading } from './TaskAnalyticsCard';
import { SurveyResultsAnalytics } from '../survey/surveyPage.slice';
import { ActivityResultsAnalytics } from '../activity/activityPage.slice';

const Content = styled.div`
  display: flex;
  height: ${px(52)};
  align-items: center;
`;

const DefaultText = styled.div`
  ${typography.headingXLargeSemibold};
  color: ${colors.textPrimaryBlue};
  margin-right: ${px(4)};
`;

const Percents = styled.div`
  ${typography.headingLargeSemibold};
  color: ${colors.textPrimaryBlue};
`;

const TimeLabel = styled.div`
  ${typography.headingSmall};
  color: ${colors.textPrimaryBlue};
  margin-right: ${px(4)};
`;

const ChartCard = styled(Card)`
  height: ${px(528)};
`;

const ChartCardLoading = () => (
  <ChartCard>
    <SkeletonLoading>
      <SkeletonRect x="0" y="0" width="240" height="24" />
      <SkeletonRect x="0" y="456" width="360" height="24" />
    </SkeletonLoading>
  </ChartCard>
);

const chartColors: SpecColorType[] = [
  'secondaryViolet',
  'secondarySkyBlue',
  'secondaryTangerine',
  'secondaryRed',
];

type TaskAnalyticsProps = {
  analytics?: SurveyResultsAnalytics | ActivityResultsAnalytics;
  loading?: boolean;
  type: TaskType;
};

const TaskAnalytics = ({ analytics, loading, type }: TaskAnalyticsProps) => {
  const byGenderChartData = useMemo(
    () =>
      analytics
        ? analytics.byGender.map((d, idx) => ({
            id: d.id,
            value: d.percentage || 0,
            color: chartColors[idx % chartColors.length] || chartColors[0],
            name: d.label,
            count: d.count || 0,
            total: d.total || 0,
          }))
        : [],
    [analytics]
  );

  const titleType = useMemo(() => {
    if (type === 'activity') {
      return 'Activity';
    }

    return 'Survey';
  }, [type]);

  const byAgeChartData = useMemo(
    () =>
      analytics
        ? analytics.byAge.map((d, idx) => ({
            id: d.id,
            value: d.percentage || 0,
            color: chartColors[idx % chartColors.length] || chartColors[0],
            name: d.label,
            count: d.count || 0,
            total: d.total || 0,
          }))
        : [],
    [analytics]
  );

  const avgCompletionTimeLabels = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const int = Duration.fromMillis(analytics.avgCompletionTimeMs);
    if (int.as('minutes') < 1) {
      const { seconds } = int.shiftTo('seconds', 'milliseconds');
      return [[seconds, 'sec']];
    }
    if (int.as('hours') < 1) {
      const { minutes, seconds } = int.shiftTo('minutes', 'seconds', 'milliseconds');
      return [
        [minutes, 'min'],
        [seconds, 'sec'],
      ];
    }
    const { hours, minutes } = int.shiftTo('hours', 'minutes', 'seconds');
    return [
      [hours, 'hr'],
      [minutes, 'min'],
    ];
  }, [analytics]);

  const analyticsCards = [
    {
      title: 'Target participants',
      children: <DefaultText>{analytics?.targetParticipants}</DefaultText>,
    },
    {
      title: 'Completed participants',
      children: <DefaultText>{analytics?.completedParticipants}</DefaultText>,
    },
    {
      title: 'Response Rate',
      children: (
        <Content>
          <DefaultText>{analytics?.responseRatePercents}</DefaultText>
          <Percents>%</Percents>
        </Content>
      ),
    },
    {
      title: 'Avg. completion time',
      children: (
        <Content>
          {avgCompletionTimeLabels.map(([value, unit]) => (
            <React.Fragment key={unit}>
              <DefaultText>{value}</DefaultText>
              <TimeLabel>{unit}</TimeLabel>
            </React.Fragment>
          ))}
        </Content>
      ),
    },
  ];

  const chartCards = [
    {
      title: `${titleType} Responses by Gender`,
      children: (
        <OverviewLegendWrapper lines={byGenderChartData}>
          <ResponsiveContainer>
            <DonutChart
              width={352}
              height={352}
              data={byGenderChartData}
              totalPercents={_sumBy(byGenderChartData, (d) => d.value)}
            />
          </ResponsiveContainer>
        </OverviewLegendWrapper>
      ),
    },
    {
      title: `${titleType} Responses by Age`,
      children: (
        <OverviewLegendWrapper lines={byAgeChartData}>
          <ResponsiveContainer>
            <PieChart width={352} height={352} data={byAgeChartData} />
          </ResponsiveContainer>
        </OverviewLegendWrapper>
      ),
    },
  ];

  return (
    <>
      <SimpleGrid columns={{ tablet: 2, laptop: 2, desktop: 4 }}>
        {analyticsCards.map((card) =>
          loading ? (
            <TaskAnalyticsCardLoading key={card.title} />
          ) : (
            <TaskAnalyticsCard key={card.title} title={card.title}>
              {card.children}
            </TaskAnalyticsCard>
          )
        )}
      </SimpleGrid>
      <SimpleGrid columns={{ tablet: 1, laptop: 1, desktop: 2 }} verticalGap>
        {chartCards.map((card) =>
          loading ? (
            <ChartCardLoading key={card.title} />
          ) : (
            <ChartCard key={card.title} title={card.title}>
              {card.children}
            </ChartCard>
          )
        )}
      </SimpleGrid>
    </>
  );
};

export default TaskAnalytics;
