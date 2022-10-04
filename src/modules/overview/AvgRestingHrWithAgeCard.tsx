import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import _uniqBy from 'lodash/uniqBy';
import _without from 'lodash/without';

import { sortGenderLines } from 'src/modules/charts/utils';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import ScatterChart, { LineItem } from 'src/modules/charts/ScatterChart';
import { px } from 'src/styles';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';

import OverviewCard from './OverviewCard';
import OverviewLegendWrapper, {
  isTrendLinesHidden,
  ADD_TREND_LABEL,
} from './OverviewLegendWrapper';
import { useAvgRestingHrWithAgeSlice } from './avgRestingHrWithAge.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  padding-bottom: ${px(20)};
`;

const AvgRestingHrWithAgeCard: React.FC = () => {
  const studyId = useSelectedStudyId();

  const {
    data = { values: [], trendLines: [] },
    isLoading,
    error,
    refetch,
  } = useAvgRestingHrWithAgeSlice({
    fetchArgs: !!studyId && {
      studyId,
    },
  });

  const [hiddenDataLines, setHiddenDataLines] = useState<string[]>([ADD_TREND_LABEL]);

  const hiddenDataLinesWithoutTrendLine = useMemo(
    () => _without(hiddenDataLines, ADD_TREND_LABEL),
    [hiddenDataLines]
  );

  const showTrendLines = useMemo(
    () => !isTrendLinesHidden(hiddenDataLines, ADD_TREND_LABEL),
    [hiddenDataLines]
  );

  return (
    <OverviewCard
      title="Avg. resting HR with age"
      subtitle="in bpm"
      empty={!isLoading && !data.values.length}
      loading={isLoading && !data.values.length}
      error={!!error}
      onReload={refetch}
    >
      <OverviewLegendWrapper
        onDataChange={setHiddenDataLines}
        lines={sortGenderLines(_uniqBy(data.values, ({ name }) => name)) as LineItem[]}
        hiddenDataLines={hiddenDataLines}
        canToggle
        addTrendItemName={ADD_TREND_LABEL}
      >
        <ResponsiveContainerStyled>
          <ScatterChart
            width={0}
            height={366}
            dots={data.values}
            lines={data.trendLines}
            showTrendLine={showTrendLines}
            hiddenDataLines={hiddenDataLinesWithoutTrendLine}
          />
        </ResponsiveContainerStyled>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default AvgRestingHrWithAgeCard;
