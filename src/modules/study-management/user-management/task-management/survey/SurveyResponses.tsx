import React from 'react';

import _minBy from 'lodash/minBy';
import _maxBy from 'lodash/maxBy';
import _range from 'lodash/range';
import styled from 'styled-components';

import { SpecColorType } from 'src/styles/theme';
import BarChart from 'src/modules/charts/BarChart';
import PieChart from 'src/modules/charts/PieChart';
import StackedBarChart from 'src/modules/charts/StackedBarChart';
import OverviewCard from 'src/modules/overview/OverviewCard';
import OverviewLegendWrapper from 'src/modules/overview/OverviewLegendWrapper';
import SimpleGrid from 'src/common/components/SimpleGrid';
import SkeletonLoading, { SkeletonRect } from 'src/common/components/SkeletonLoading';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import { px } from 'src/styles';
import { SurveyResultsResponse } from './surveyPage.slice';
import SurveyResponsesCard from './SurveyResponsesCard';
import SurveyResponseImages from './SurveyResponseImages';
import SurveyResponsesList from './SurveyResponsesList';

const ChartWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const CenteredResponsiveContainer = styled(ResponsiveContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledStackedBarChart = styled(StackedBarChart)`
  margin-top: ${px(18)};
`;

const ChartCardLoading = () => (
  <OverviewCard>
    <SkeletonLoading>
      <SkeletonRect x="0" y="0" width="240" height="24" />
      <SkeletonRect x="0" y="456" width="360" height="24" />
    </SkeletonLoading>
  </OverviewCard>
);

const pieChartColors: SpecColorType[] = [
  'secondaryViolet',
  'secondarySkyBlue',
  'secondaryTangerine',
  'secondaryRed',
  'secondaryGreen',
];

const barChartDefaultColor: SpecColorType = 'secondarySkyblue';

type SurveyResponsesProps = {
  responses?: SurveyResultsResponse[];
  loading?: boolean;
};

const SurveyResponses = ({ responses, loading }: SurveyResponsesProps) => {
  const getChart = (qResponse: SurveyResultsResponse) => {
    switch (qResponse.questionType) {
      case 'multiple': {
        const chartData = qResponse.answers.map((a) => ({
          name: a.label,
          value: a.count || 0,
          totalValue: a.total || 0,
        }));

        return (
          <ChartWrapper>
            <CenteredResponsiveContainer>
              {({ width }) => <BarChart width={width} height={378} data={chartData} />}
            </CenteredResponsiveContainer>
          </ChartWrapper>
        );
      }
      case 'slider': {
        const chartData = qResponse.answers.map((a) => ({
          id: a.id,
          scaleValue: +a.label,
          percentage: a.percentage || 0,
          extraLabel: a.extraLabel || '',
        }));
        const min = _minBy(chartData, (d) => d.scaleValue);
        const max = _maxBy(chartData, (d) => d.scaleValue);
        const legendData =
          min && max
            ? [
                {
                  id: 'min',
                  name: `${min?.scaleValue} (${min?.extraLabel})`,
                  color: barChartDefaultColor,
                  opacity: 0.1,
                },
                {
                  id: 'max',
                  name: `${max?.scaleValue} (${max?.extraLabel})`,
                  color: barChartDefaultColor,
                  opacity: 1,
                },
              ]
            : [];

        return (
          <OverviewLegendWrapper lines={legendData} mode="space-between">
            <ChartWrapper>
              <CenteredResponsiveContainer>
                {({ width }) => (
                  <StyledStackedBarChart
                    width={width}
                    height={353}
                    data={chartData}
                    minScale={min?.scaleValue}
                    maxScale={max?.scaleValue}
                  />
                )}
              </CenteredResponsiveContainer>
            </ChartWrapper>
          </OverviewLegendWrapper>
        );
      }
      case 'single':
      case 'dropdown': {
        const chartData = qResponse.answers.map((a, idx) => ({
          id: a.id,
          value: a.percentage || 0,
          color: pieChartColors[idx % pieChartColors.length] || pieChartColors[0],
          name: a.label,
          total: a.total || 0,
          count: a.count || 0,
        }));

        return (
          <OverviewLegendWrapper lines={chartData}>
            <ChartWrapper>
              <PieChart width={352} height={352} data={chartData} />
            </ChartWrapper>
          </OverviewLegendWrapper>
        );
      }
      case 'images': {
        return <SurveyResponseImages qResponse={qResponse} />;
      }
      case 'open-ended':
      case 'date-time': {
        return (
          <SurveyResponsesList
            responses={qResponse.answers.map((a) => ({
              id: a.id,
              label: a.extraLabel || '',
              answer: a.label,
            }))}
          />
        );
      }
      case 'rank': {
        return (
          <SurveyResponsesList
            responses={qResponse.answers.map((a, idx) => ({
              id: a.id,
              label: `#${idx + 1}`,
              extraLabel: `Average: ${a.count?.toFixed(2)}/${a.total?.toFixed(2)}`,
              answer: a.label,
            }))}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <SimpleGrid columns={{ tablet: 1, laptop: 1, desktop: 2 }} verticalGap>
      {loading
        ? _range(2).map((idx) => <ChartCardLoading key={idx} />)
        : responses
            ?.filter((r) => !!getChart(r))
            .map((r, index) => (
              <SurveyResponsesCard
                key={r.id}
                title={`${index + 1}. ${r.questionTitle}`}
                subtitle={r.questionDescription}
              >
                {getChart(r)}
              </SurveyResponsesCard>
            ))}
    </SimpleGrid>
  );
};

export default SurveyResponses;
