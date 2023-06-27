import React, { useMemo, useRef } from 'react';

import styled from 'styled-components';

import { Path } from 'src/modules/navigation/store';
import { useAppSelector } from 'src/modules/store';
import CollapseSection from 'src/common/components/CollapseSection';
import SimpleGrid, { SimpleGridCell } from 'src/common/components/SimpleGrid';
import { userRoleSelector } from 'src/modules/auth/auth.slice.userRoleSelector';
import { px } from 'src/styles';

import AvgRestingHrOverDayCard from './AvgRestingHrOverDayCard';
import AvgRestingHrWithAgeCard from './AvgRestingHrWithAgeCard';
import ParticipantListCard from './ParticipantListCard';
import StudyProgress from './StudyProgress';
import ParticipantDropout from './ParticipantDropout';
import ParticipantEnrollmentCard from './ParticipantEnrollmentCard';
import TaskCompliance from './TaskCompliance';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(32)};
`;

type Props = {
  isSwitchStudy?: boolean;
};

const Overview: React.FC<Props> = ({ isSwitchStudy }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const userRole = useAppSelector(userRoleSelector);

  const content = useMemo(() => {
    const participantManagement = (
      <CollapseSection title="Participant Management" key="participant-management">
        <ParticipantListCard subjectSection={Path.OverviewSubject} />
      </CollapseSection>
    );

    const studyOverview = (
      <CollapseSection title="Study Overview" key="study-overview">
        <SectionContainer>
          <SimpleGrid verticalGap columns={{ desktop: 12, laptop: 12, tablet: 10 }}>
            <SimpleGridCell columns={{ desktop: [1, 8], laptop: [1, 8], tablet: [1, 10] }}>
              <StudyProgress isSwitchStudy={isSwitchStudy} />
            </SimpleGridCell>
            <SimpleGridCell columns={{ desktop: [9, 12], laptop: [9, 12], tablet: [1, 6] }}>
              <ParticipantDropout />
            </SimpleGridCell>
            <SimpleGridCell columns={{ desktop: [1, 6], laptop: [1, 6], tablet: [1, 10] }}>
              <ParticipantEnrollmentCard />
            </SimpleGridCell>
            <SimpleGridCell columns={{ desktop: [7, 12], laptop: [7, 12], tablet: [1, 10] }}>
              <TaskCompliance />
            </SimpleGridCell>
          </SimpleGrid>
        </SectionContainer>
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

    if (!userRole?.roles || !userRole?.roles.length) {
      return null;
    }
    return [studyOverview, participantManagement, sensorData];
  }, [userRole, isSwitchStudy]);

  return (
    <div ref={containerRef} data-testid="overview">
      <SimpleGrid fullScreen>{content}</SimpleGrid>
    </div>
  );
};

export default Overview;
