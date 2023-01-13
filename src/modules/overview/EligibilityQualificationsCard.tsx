import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useUnmount } from 'react-use';

import { px } from 'src/styles';
import ResponsiveContainer from 'src/common/components/ResponsiveContainer';
import BarChart from 'src/modules/charts/BarChart';
// import Dropdown from 'src/common/components/Dropdown';
import OverviewCard from './OverviewCard';
import { useEligibilityQualificationsData } from './overview.slice';

const ResponsiveContainerStyled = styled(ResponsiveContainer)`
  padding-top: ${px(24)};
`;

/* const DropdownWrapper = styled.div`
  width: ${px(119)};
`; */

// type ChartOrientations = 'vertical' | 'horizontal';

const EligibilityQualificationsCard: React.FC = () => {
  // const [orientation, setOrientation] = useState<ChartOrientations>('vertical');
  // const [contentChanging, setContentChanging] = useState<boolean>(false);
  const timerId = useRef<NodeJS.Timeout>();

  useUnmount(() => {
    clearTimeout(timerId.current);
  });

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useEligibilityQualificationsData({
    fetchArgs: undefined,
  });

  const chartData = useMemo(() => data.map((g) => ({ ...g, name: g.group })), [data]);

  /* const changeOrientation = useCallback((v: string) => {
    setOrientation(v as ChartOrientations);
    setContentChanging(true);
    timerId.current = setTimeout(() => setContentChanging(false), 100);
  }, []); */

  return (
    <OverviewCard
      data-testid="eligibility-qualifications-card"
      title="Eligibility Qualifications"
      subtitle="Recall the feelings you had today."
      error={!!error}
      onReload={refetch}
      /* action={
        <DropdownWrapper>
          <Dropdown
            items={[
              { label: 'Vertical', key: 'vertical' },
              { label: 'Horizontal', key: 'horizontal' },
            ]}
            activeKey={orientation}
            onChange={changeOrientation}
          />
        </DropdownWrapper>
      } */
      empty={!isLoading && !data.length}
      loading={isLoading && !data.length}
    >
      <ResponsiveContainerStyled>
        <BarChart width={0} height={374} data={chartData} />
      </ResponsiveContainerStyled>
    </OverviewCard>
  );
};

export default EligibilityQualificationsCard;
