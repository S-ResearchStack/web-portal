import React, { useMemo } from 'react';
import styled from 'styled-components';
import _uniq from 'lodash/uniq';
import _upperFirst from 'lodash/upperFirst';

import { SpecColorType } from 'src/styles/theme';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import GroupedBarChart from 'src/modules/charts/GroupedBarChart';
import OverviewCard from './OverviewCard';
import OverviewLegendWrapper from './OverviewLegendWrapper';
import { useAvgHeartRateFluctuationsData } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)``;

const colors: SpecColorType[] = ['secondaryViolet', 'secondaryGreen'];

const MARGIN = { top: 5, right: 0, bottom: 32, left: 32 };

const AvgHeartRateFluctuationsCard: React.FC = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useAvgHeartRateFluctuationsData({
    fetchArgs: undefined,
  });

  const dataKeys = useMemo(() => _uniq(data.map((dataItem) => dataItem.name)), [data]);

  return (
    <OverviewCard
      data-testid="avg-heart-rate-fluctuations-card"
      title="Avg. Heart Rate Fluctuations"
      subtitle="HR Value + / - from baseline (ECG monitor patch)"
      error={!!error}
      onReload={refetch}
      empty={!isLoading && !data.length}
      loading={isLoading && !data.length}
    >
      <OverviewLegendWrapper lines={dataKeys.map((d, i) => ({ name: d, color: colors[i] }))}>
        <ResponsiveContainerStyled>
          <GroupedBarChart
            width={0}
            height={374}
            data={data}
            barColors={colors}
            numberOfKeys={dataKeys.length}
            maxValue={10}
            showYNegativeArea
            formatXAxisTick={(d) => _upperFirst(`${d}`)}
            yTickValues={[-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10]}
            chartMargin={MARGIN}
          />
        </ResponsiveContainerStyled>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default AvgHeartRateFluctuationsCard;
