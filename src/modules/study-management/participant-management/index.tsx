import React from 'react';

import styled from 'styled-components';

import ParticipantListCard from 'src/modules/overview/ParticipantListCard';
import { Path } from 'src/modules/navigation/store';
import CollapseSection from 'src/common/components/CollapseSection';
import { px } from 'src/styles';
import LabVisit from './lab-visit/LabVisit';

const ParticipantManagementContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: ${px(24)};
`;

const ParticipantManagement = () => (
  <CollapseSection title="Participant Management">
    <ParticipantManagementContainer>
      <ParticipantListCard subjectSection={Path.StudyManagementSubject} />
      <LabVisit />
    </ParticipantManagementContainer>
  </CollapseSection>
);

export default ParticipantManagement;
