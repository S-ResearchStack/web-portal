import React, { useMemo } from 'react';
import styled from 'styled-components';

import { px } from 'src/styles';
import { SpecColorType } from 'src/styles/theme';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import PieChart from 'src/modules/charts/PieChart';
import OverviewCard from './OverviewCard';
import OverviewLegendWrapper from './OverviewLegendWrapper';
import { useSurveyResponsesByAgeData } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  margin-top: ${px(45)};
  margin-bottom: ${px(39)};
`;

const colors: SpecColorType[] = [
  'secondarySkyBlue',
  'secondaryTangerine',
  'secondaryRed',
  'secondaryViolet',
  'secondaryGreen',
];

const SurveyResponsesByAgeCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useSurveyResponsesByAgeData({
    fetchArgs: undefined,
  });

  const chartData = useMemo(
    () =>
      (data || []).map((d, idx) => ({
        value: d.percentage,
        color: colors[idx % colors.length],
        name: d.group,
        count: +d.count,
        total: d.total,
      })),
    [data]
  );

  return (
    <OverviewCard
      data-testid="survey-responses-by-age-card"
      title="Survey Responses by Age"
      error={!!error}
      onReload={refetch}
      empty={!isLoading && !data}
      loading={isLoading && !data}
    >
      <OverviewLegendWrapper lines={chartData}>
        <ResponsiveContainerStyled>
          <PieChart width={0} height={352} data={chartData} />
        </ResponsiveContainerStyled>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default SurveyResponsesByAgeCard;
