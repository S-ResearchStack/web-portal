import React from 'react';
import styled from 'styled-components';
import _minBy from 'lodash/minBy';
import _maxBy from 'lodash/maxBy';

import { SpecColorType } from 'src/styles/theme';
import { px } from 'src/styles';
import BarChart from 'src/modules/charts/BarChart';
import PieChart from 'src/modules/charts/PieChart';
import StackedBarChart from 'src/modules/charts/StackedBarChart';
import OverviewCard from 'src/modules/overview/OverviewCard';
import OverviewLegendWrapper from 'src/modules/overview/OverviewLegendWrapper';
import SimpleGrid from 'src/common/components/SimpleGrid';
import { SurveyResultsResponse } from './surveyPage.slice';

const BarChartWrapper = styled.div`
  margin-top: ${px(24)};
`;

const StackedBarChartWrapper = styled.div`
  margin: ${px(24)} 0 ${px(8)};
`;

const PieChartWrapper = styled.div<{ $hasDescription?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: ${({ $hasDescription }) => ($hasDescription ? 0 : px(23))};
  margin-bottom: ${({ $hasDescription }) => ($hasDescription ? px(30) : px(39))};
`;

const pieChartColors: SpecColorType[] = [
  'updSecondaryViolet',
  'updSecondarySkyBlue',
  'updSecondaryTangerine',
  'updSecondaryRed',
  'updSecondaryGreen',
];

const barChartDefaultColor: SpecColorType = 'secondarySkyblue';

type SurveyResponsesProps = {
  responses: SurveyResultsResponse[];
};

const SurveyResponses = ({ responses }: SurveyResponsesProps) => {
  const getChart = (qResponse: SurveyResultsResponse) => {
    switch (qResponse.questionType) {
      case 'multiple': {
        const chartData = qResponse.answers.map((a) => ({
          name: a.label,
          value: a.count,
          totalValue: a.total || 0,
        }));

        return (
          <BarChartWrapper>
            <BarChart width={480} height={378} data={chartData} />
          </BarChartWrapper>
        );
      }
      case 'slider': {
        const chartData = qResponse.answers.map((a) => ({
          scaleValue: +a.label,
          percentage: a.percentage,
          extraLabel: a.extraLabel,
        }));
        const min = _minBy(chartData, (d) => d.scaleValue);
        const max = _maxBy(chartData, (d) => d.scaleValue);
        const legendData =
          min && max
            ? [
                {
                  name: `${min?.scaleValue} (${min?.extraLabel})`,
                  color: barChartDefaultColor,
                  opacity: 0.1,
                },
                {
                  name: `${max?.scaleValue} (${max?.extraLabel})`,
                  color: barChartDefaultColor,
                  opacity: 1,
                },
              ]
            : [];

        return (
          <OverviewLegendWrapper lines={legendData} mode="space-between">
            <StackedBarChartWrapper>
              <StackedBarChart
                width={480}
                height={353}
                data={chartData}
                minScale={min?.scaleValue}
                maxScale={max?.scaleValue}
              />
            </StackedBarChartWrapper>
          </OverviewLegendWrapper>
        );
      }
      case 'single': {
        const chartData = qResponse.answers.map((a, idx) => ({
          value: a.percentage,
          color: pieChartColors[idx % pieChartColors.length],
          name: a.label,
          total: a.total,
          count: a.count,
        }));

        return (
          <OverviewLegendWrapper lines={chartData}>
            <PieChartWrapper $hasDescription={!!qResponse.questionDescription}>
              <PieChart width={352} height={352} data={chartData} />
            </PieChartWrapper>
          </OverviewLegendWrapper>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SimpleGrid columns={{ tablet: 2, laptop: 2, desktop: 2 }} verticalGap>
      {responses.map((r, index) => (
        <OverviewCard
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          title={`${index + 1}. ${r.questionTitle}`}
          subtitle={r.questionDescription}
        >
          {getChart(r)}
        </OverviewCard>
      ))}
    </SimpleGrid>
  );
};

export default SurveyResponses;
