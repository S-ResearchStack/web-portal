import React from 'react';
import styled from 'styled-components';

import SimpleGrid from 'src/common/components/SimpleGrid';
import CollapseSection from 'src/common/components/CollapseSection';
import LabVisit from './LabVisit';
import { px } from 'src/styles';

const LabVisitContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: ${px(24)};
`;

const LabVisitManagement = () => (
  <SimpleGrid fullScreen>
    <CollapseSection title="In-lab visit Management">
      <LabVisitContainer>
        <LabVisit />
      </LabVisitContainer>
    </CollapseSection>
  </SimpleGrid>
);

export default LabVisitManagement;
