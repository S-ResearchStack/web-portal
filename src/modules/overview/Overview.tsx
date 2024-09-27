import React from 'react';

import CollapseSection from 'src/common/components/CollapseSection';
import StudyOverview from './StudyOverview';
import styled from 'styled-components';

const OverviewContainer = styled.div`
  margin: 0 50px;
`
type Props = {
  isSwitchStudy?: boolean;
};

const Overview: React.FC<Props> = ({ isSwitchStudy }) => {
  return (
    <OverviewContainer data-testid="overview">
      <CollapseSection title="Study Overview">
        <StudyOverview isSwitchStudy={isSwitchStudy} />
      </CollapseSection>
    </OverviewContainer>
  );
}

export default Overview;
