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
import OverviewLegendWrapper from '../overview/OverviewLegendWrapper';
import SurveyAnalyticsCard from './SurveyAnalyticsCard';
import { SurveyResultsAnalytics } from './surveyPage.slice';

const Content = styled.div`
  display: flex;
  height: ${px(52)};
  align-items: center;
`;

const DefaultText = styled.div`
  ${typography.headingXLargeSemibold};
  color: ${colors.updTextPrimaryBlue};
  margin-right: ${px(4)};
`;

const Percents = styled.div`
  ${typography.headingLargeSemibold};
  color: ${colors.updTextPrimaryBlue};
`;

const TimeLabel = styled.div`
  ${typography.headingSmall};
  color: ${colors.updTextPrimaryBlue};
  margin-right: ${px(4)};
`;

const ChartCard = styled(Card)`
  height: ${px(528)};
`;

const chartColors: SpecColorType[] = [
  'updSecondaryViolet',
  'updSecondarySkyBlue',
  'updSecondaryTangerine',
  'updSecondaryRed',
];

type SurveyAnalyticsProps = {
  analytics: SurveyResultsAnalytics;
};

const SurveyAnalytics = ({ analytics }: SurveyAnalyticsProps) => {
  const byGenderChartData = useMemo(
    () =>
      analytics.byGender.map((d, idx) => ({
        value: d.percentage,
        color: chartColors[idx % chartColors.length],
        name: d.label,
        count: d.count,
        total: d.total,
      })),
    [analytics.byGender]
  );

  const byAgeChartData = useMemo(
    () =>
      analytics.byAge.map((d, idx) => ({
        value: d.percentage,
        color: chartColors[idx % chartColors.length],
        name: d.label,
        count: d.count,
        total: d.total,
      })),
    [analytics.byAge]
  );

  const avgCompletionTimeLabels = useMemo(() => {
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
  }, [analytics.avgCompletionTimeMs]);

  return (
    <>
      <SimpleGrid columns={{ tablet: 2, laptop: 2, desktop: 4 }}>
        <SurveyAnalyticsCard title="Target participants">
          <DefaultText>{analytics.targetParticipants}</DefaultText>
        </SurveyAnalyticsCard>
        <SurveyAnalyticsCard title="Completed participants">
          <DefaultText>{analytics.completedParticipants}</DefaultText>
        </SurveyAnalyticsCard>
        <SurveyAnalyticsCard title="Response rate">
          <Content>
            <DefaultText>{analytics.responseRatePercents}</DefaultText>
            <Percents>%</Percents>
          </Content>
        </SurveyAnalyticsCard>
        <SurveyAnalyticsCard title="Avg. completion time">
          <Content>
            {avgCompletionTimeLabels.map(([value, unit]) => (
              <React.Fragment key={unit}>
                <DefaultText>{value}</DefaultText>
                <TimeLabel>{unit}</TimeLabel>
              </React.Fragment>
            ))}
          </Content>
        </SurveyAnalyticsCard>
      </SimpleGrid>
      <SimpleGrid columns={{ tablet: 1, laptop: 1, desktop: 2 }}>
        <ChartCard title="Survey Responses by Gender">
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
        </ChartCard>
        <ChartCard title="Survey Responses by Age">
          <OverviewLegendWrapper lines={byAgeChartData}>
            <ResponsiveContainer>
              <PieChart width={352} height={352} data={byAgeChartData} />
            </ResponsiveContainer>
          </OverviewLegendWrapper>
        </ChartCard>
      </SimpleGrid>
    </>
  );
};

export default SurveyAnalytics;
