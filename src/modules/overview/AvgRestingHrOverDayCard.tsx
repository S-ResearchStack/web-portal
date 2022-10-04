import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { generatePath, useHistory } from 'react-router-dom';
import _uniqBy from 'lodash/uniqBy';
import _without from 'lodash/without';

import { Path } from 'src/modules/navigation/store';
import { sortGenderLines } from 'src/modules/charts/utils';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import LineChart, { DataItem } from 'src/modules/charts/LineChart';
import { px } from 'src/styles';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import OverviewCard from './OverviewCard';
import OverviewLegendWrapper, {
  isTrendLinesHidden,
  AVERAGE_LINE_LABEL,
} from './OverviewLegendWrapper';
import { useAvgRestingHrOverDaySlice } from './avgRestingHrOverDay.slice';

const ResponsiveContainerWrapper = styled(ResponsiveContainer)`
  padding-bottom: ${px(20)};
`;

const AvgRestingHrOverDayCard: React.FC = () => {
  const studyId = useSelectedStudyId();

  const {
    data = { values: [], timeDomain: [] },
    isLoading,
    error,
    refetch,
  } = useAvgRestingHrOverDaySlice({
    fetchArgs: !!studyId && {
      studyId,
    },
  });

  const [hiddenDataLines, setHiddenDataLines] = useState<string[]>([AVERAGE_LINE_LABEL]);

  const history = useHistory();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDotClick = (_: React.MouseEvent<SVGPathElement, MouseEvent>, d: DataItem) => {
    const SUBJECT_ID = 'SUBJECT_ID'; // TODO replace to d.id
    history.push(
      generatePath(Path.OverviewSubject, {
        subjectId: SUBJECT_ID,
      })
    );
  };

  const hiddenDataLinesWithoutAverage = useMemo(
    () => _without(hiddenDataLines, AVERAGE_LINE_LABEL),
    [hiddenDataLines]
  );

  const showTrendLines = useMemo(
    () => !isTrendLinesHidden(hiddenDataLines, AVERAGE_LINE_LABEL),
    [hiddenDataLines]
  );

  return (
    <OverviewCard
      title="Avg. resting HR in 24 hrs"
      subtitle="in bpm"
      empty={!isLoading && !data.values.length}
      loading={isLoading}
      error={!!error}
      onReload={refetch}
    >
      <OverviewLegendWrapper
        onDataChange={setHiddenDataLines}
        lines={sortGenderLines(_uniqBy(data.values, ({ name }) => name)) as DataItem[]}
        hiddenDataLines={hiddenDataLines}
        canToggle
        addTrendItemName={AVERAGE_LINE_LABEL}
      >
        <ResponsiveContainerWrapper>
          <LineChart
            width={0}
            height={366}
            data={data.values}
            showTrendLines={showTrendLines}
            xDomain={data.timeDomain}
            onDotClick={handleDotClick}
            hiddenDataLines={hiddenDataLinesWithoutAverage}
          />
        </ResponsiveContainerWrapper>
      </OverviewLegendWrapper>
    </OverviewCard>
  );
};

export default AvgRestingHrOverDayCard;
