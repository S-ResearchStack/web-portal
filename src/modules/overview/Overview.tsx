import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';

import { userRoleSelector } from 'src/modules/auth/auth.slice';
import { Path } from 'src/modules/navigation/store';
import { useAppSelector } from 'src/modules/store';
import CollapseSection from 'src/common/components/CollapseSection';
import { px } from 'src/styles';
import SimpleGrid from 'src/common/components/SimpleGrid';
import { getRoleFunction } from 'src/modules/auth/userRole';
import AvgRestingHrOverDayCard from './AvgRestingHrOverDayCard';
import AvgRestingHrWithAgeCard from './AvgRestingHrWithAgeCard';
import ParticipantListCard from './ParticipantListCard';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(32)};
`;

const Overview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const userRole = useAppSelector(userRoleSelector);

  const content = useMemo(() => {
    const participantManagement = (
      <CollapseSection title="Participant Management" key="participant-management">
        <ParticipantListCard subjectSection={Path.OverviewSubject} />
      </CollapseSection>
    );

    const sensorData = (
      <CollapseSection title="Sensor Data" key="sensor-data">
        <SectionContainer>
          <AvgRestingHrOverDayCard />
          <AvgRestingHrWithAgeCard />
        </SectionContainer>
      </CollapseSection>
    );

    if (!userRole?.role) {
      return null;
    }
    return getRoleFunction(userRole.role) === 'principal_investigator'
      ? [sensorData, participantManagement]
      : [participantManagement, sensorData];
  }, [userRole]);

  return (
    <div ref={containerRef}>
      <SimpleGrid fullScreen>{content}</SimpleGrid>
    </div>
  );
};

export default Overview;
