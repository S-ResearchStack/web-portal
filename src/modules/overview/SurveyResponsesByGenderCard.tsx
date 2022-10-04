import React, { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

import { px } from 'src/styles';
import { sortGenderLines } from 'src/modules/charts/utils';
import { SpecColorType } from 'src/styles/theme';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import DonutChart from 'src/modules/charts/DonutChart';
import OverviewCard from './OverviewCard';
import OverviewLegendWrapper from './OverviewLegendWrapper';
import { useSurveyResponsesByGenderData } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  margin-top: ${px(45)};
  margin-bottom: ${px(39)};
`;

const colors: SpecColorType[] = ['updSecondarySkyBlue', 'updSecondaryViolet'];

const SurveyResponsesByGenderCard: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading, error, refetch } = useSurveyResponsesByGenderData({
    fetchArgs: undefined,
  });

  const chartData = useMemo(() => {
    const { items = [], totalPercents = 0 } = data || {};

    return {
      ...data,
      items: [
        ...items.map((d, idx) => ({
          value: d.percentage,
          color: colors[idx % colors.length],
          name: d.group,
          count: d.count,
          total: d.total,
        })),
        {
          value: 100 - totalPercents,
          color: 'disabled' as SpecColorType,
          name: '',
          count: 0,
          total: 0,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, theme]);

  return (
    <OverviewCard
      title="Survey Responses by Gender"
      error={!!error}
      onReload={refetch}
      empty={!isLoading && !data}
      loading={isLoading && !data}
    >
      <OverviewLegendWrapper
        lines={
          sortGenderLines(chartData.items.slice(0, -1)) as { name: string; color: SpecColorType }[]
        }
      >
        <ResponsiveContainerStyled>
          <DonutChart
            width={0}
            height={352}
            data={chartData.items}
            totalPercents={chartData.totalPercents || 0}
          />
        </ResponsiveContainerStyled>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default SurveyResponsesByGenderCard;
