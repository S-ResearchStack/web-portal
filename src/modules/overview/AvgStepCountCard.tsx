import React, { useMemo } from 'react';
import styled from 'styled-components';
import _uniq from 'lodash/uniq';
import _maxBy from 'lodash/maxBy';

import { SpecColorType } from 'src/styles/theme';
import { px } from 'src/styles';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import GroupedBarChart from 'src/modules/charts/GroupedBarChart';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import OverviewCard from './OverviewCard';
import OverviewLegendWrapper from './OverviewLegendWrapper';
import { useAvgStepCountData } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  padding-top: ${px(45)};
`;

const colors: SpecColorType[] = ['secondaryGreen', 'secondaryPurple'];

const VALUES_STEP = 2000;
const DEFAULT_VALUE = 10000;

const AvgStepCountCard: React.FC = () => {
  const studyId = useSelectedStudyId();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useAvgStepCountData({
    fetchArgs: !!studyId && { studyId },
  });

  const dataKeys = useMemo(() => _uniq(data.map((dataItem) => dataItem.name)), [data]);

  const maxValue = _maxBy(data, (d) => d.value)?.value;
  const maxYValue = Math.ceil((maxValue || DEFAULT_VALUE) / VALUES_STEP) * VALUES_STEP;

  return (
    <OverviewCard
      title="Avg. Step Count"
      empty={!isLoading && !data.length}
      loading={isLoading && !data.length}
      error={!!error}
      onReload={refetch}
    >
      <OverviewLegendWrapper lines={dataKeys.map((d, i) => ({ name: d, color: colors[i] }))}>
        <ResponsiveContainerStyled>
          <GroupedBarChart
            width={0}
            height={374}
            data={data}
            barColors={colors}
            numberOfKeys={dataKeys.length}
            maxValue={maxYValue}
            formatXAxisTick={(d) => (d ? `${+d / 1000}k` : '0')}
            isHorizontal
          />
        </ResponsiveContainerStyled>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default AvgStepCountCard;
