import _sumBy from 'lodash/sumBy';
import { Duration } from 'luxon';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import Card from 'src/common/components/Card';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import SimpleGrid from 'src/common/components/SimpleGrid';
import DonutChart from 'src/modules/charts/DonutChart';
import PieChart from 'src/modules/charts/PieChart';
import { colors, px, typography } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';

import OverviewLegendWrapper from '../overview/OverviewLegendWrapper';
import SurveyAnalyticsCard, { SurveyAnalyticsCardLoading } from './SurveyAnalyticsCard';
import { SurveyResultsAnalytics } from './surveyPage.slice';

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

type SurveyAnalyticsProps = {
  analytics?: SurveyResultsAnalytics;
  loading?: boolean;
};

const SurveyAnalytics = ({ analytics, loading }: SurveyAnalyticsProps) => {
  const byGenderChartData = useMemo(
    () =>
      analytics
        ? analytics.byGender.map((d, idx) => ({
            value: d.percentage,
            color: chartColors[idx % chartColors.length],
            name: d.label,
            count: d.count,
            total: d.total,
          }))
        : [],
    [analytics]
  );

  const byAgeChartData = useMemo(
    () =>
      analytics
        ? analytics.byAge.map((d, idx) => ({
            value: d.percentage,
            color: chartColors[idx % chartColors.length],
            name: d.label,
            count: d.count,
            total: d.total,
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
      title: 'Survey Responses by Gender',
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
      title: 'Survey Responses by Age',
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
            <SurveyAnalyticsCardLoading key={card.title} />
          ) : (
            <SurveyAnalyticsCard key={card.title} title={card.title}>
              {card.children}
            </SurveyAnalyticsCard>
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

export default SurveyAnalytics;
